// server.js
import express from "express";
import dotenv from "dotenv";
import fetch from "node-fetch";
import cors from "cors";

// Authorize.Net SDK
import { APIContracts, APIControllers, SDKConstants } from "authorizenet";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

const {
  ANET_LOGIN_ID,
  ANET_TRANSACTION_KEY,
  ANET_ENV = "SANDBOX", // or "PRODUCTION"
  BASE_URL = "http://localhost:3000", // your site root for return/cancel
} = process.env;

function getMerchantAuthentication() {
  const auth = new APIContracts.MerchantAuthenticationType();
  auth.setName(ANET_LOGIN_ID);
  auth.setTransactionKey(ANET_TRANSACTION_KEY);
  return auth;
}

function buildHostedPaymentRequest({ amount, orderInfo }) {
  const txnRequest = new APIContracts.TransactionRequestType();
  txnRequest.setTransactionType(APIContracts.TransactionTypeEnum.AUTHCAPTURETRANSACTION);
  txnRequest.setAmount(amount);

  // Optional: order info (invoice, description)
  if (orderInfo) {
    const order = new APIContracts.OrderType();
    order.setInvoiceNumber(orderInfo.invoice || ("Sikar-" + Date.now()));
    order.setDescription(orderInfo.description || "Custom Sikar Order");
    txnRequest.setOrder(order);
  }

  // Hosted payment page settings
  const setting = (name, value) => {
    const s = new APIContracts.SettingType();
    s.setSettingName(name);
    s.setSettingValue(value);
    return s;
  };

  const settings = new APIContracts.ArrayOfSetting();
  settings.setSetting([
    // return/cancel redirects
    setting("hostedPaymentReturnOptions", JSON.stringify({
      showReceipt: false,
      url: `${BASE_URL}/confirmation.html`,
      urlText: "Return to Sikars",
      cancelUrl: `${BASE_URL}/confirmation.html?status=cancelled`,
      cancelUrlText: "Cancel and Return",
    })),
    // style & payment options (optional)
    setting("hostedPaymentButtonOptions", JSON.stringify({ text: "Pay Now" })),
    setting("hostedPaymentOrderOptions", JSON.stringify({ show: true })),
    setting("hostedPaymentPaymentOptions", JSON.stringify({ cardCodeRequired: true })),
  ]);

  const request = new APIContracts.GetHostedPaymentPageRequest();
  request.setMerchantAuthentication(getMerchantAuthentication());
  request.setTransactionRequest(txnRequest);
  request.setHostedPaymentSettings(settings);
  return request;
}

app.post("/api/anet/create-session", async (req, res) => {
  try {
    const { size, box, flavor, engraving, bandText, price } = req.body || {};
    // Always compute on server if you need to prevent tampering.
    const amount = Number(price || 0).toFixed(2);

    const request = buildHostedPaymentRequest({
      amount,
      orderInfo: {
        description: `Sikar: ${size}/${box}/${flavor} | Eng:${engraving || "-"} | Band:${bandText || "-"}`,
      },
    });

    const ctrl = new APIControllers.GetHostedPaymentPageController(request.getJSON());
    ctrl.setEnvironment(
      ANET_ENV.toUpperCase() === "PRODUCTION"
        ? SDKConstants.endpoint.production
        : SDKConstants.endpoint.sandbox
    );

    ctrl.execute(() => {
      const apiResponse = ctrl.getResponse();
      const response = new APIContracts.GetHostedPaymentPageResponse(apiResponse);

      if (
        response != null &&
        response.getMessages().getResultCode() === APIContracts.MessageTypeEnum.OK
      ) {
        const token = response.getToken();
        // Direct link style:
        const url = `https://accept.authorize.net/payment/payment?token=${encodeURIComponent(token)}`;
        res.json({ url, token });
      } else {
        const message = response?.getMessages()?.getMessage()[0]?.getText() || "Authorize.Net error";
        res.status(400).json({ error: message });
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error creating payment session" });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`ANet backend running on ${PORT}`));
