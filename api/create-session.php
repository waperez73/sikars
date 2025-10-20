<?php
header("Content-Type: application/json");
require __DIR__ . "/../vendor/autoload.php";

use net\authorize\api\contract\v1 as AnetAPI;
use net\authorize\api\controller as AnetController;

$API_LOGIN_ID = "YOUR_API_LOGIN_ID";
$TRANSACTION_KEY = "YOUR_TRANSACTION_KEY";
$SANDBOX = true; // switch to false for production

$input = json_decode(file_get_contents("php://input"), true);

if (!$input) {
    echo json_encode(["error" => "Invalid request"]);
    exit;
}

try {
    $merchantAuthentication = new AnetAPI\MerchantAuthenticationType();
    $merchantAuthentication->setName($API_LOGIN_ID);
    $merchantAuthentication->setTransactionKey($TRANSACTION_KEY);

    $refId = 'ref' . time();

    // Create order info
    $order = new AnetAPI\OrderType();
    $order->setInvoiceNumber("INV-" . rand(1000, 9999));
    $order->setDescription("Custom Sikar Cigar Order");

    // Customer info
    $customerData = new AnetAPI\CustomerDataType();
    $customerData->setType("individual");
    if (!empty($input["email"])) {
        $customerData->setEmail($input["email"]);
    }

    // Billing Address
    $billTo = new AnetAPI\CustomerAddressType();
    $billTo->setFirstName($input["firstName"] ?? "Guest");
    $billTo->setLastName($input["lastName"] ?? "Customer");
    $billTo->setAddress($input["address"] ?? "");
    $billTo->setCity($input["city"] ?? "");
    $billTo->setState($input["state"] ?? "");
    $billTo->setZip($input["zip"] ?? "");
    $billTo->setCountry($input["country"] ?? "US");

    // Shipping Address
    $shipTo = new AnetAPI\NameAndAddressType();
    $shipTo->setFirstName($input["firstName"] ?? "Guest");
    $shipTo->setLastName($input["lastName"] ?? "Customer");
    $shipTo->setCompany($input["company"] ?? "");
    $shipTo->setAddress($input["address"] ?? "");
    $shipTo->setCity($input["city"] ?? "");
    $shipTo->setState($input["state"] ?? "");
    $shipTo->setZip($input["zip"] ?? "");
    $shipTo->setCountry($input["country"] ?? "US");

    // Transaction request
    $transactionRequestType = new AnetAPI\TransactionRequestType();
    $transactionRequestType->setTransactionType("authCaptureTransaction");
    $transactionRequestType->setAmount($input["price"]);
    $transactionRequestType->setOrder($order);
    $transactionRequestType->setCustomer($customerData);
    $transactionRequestType->setBillTo($billTo);
    $transactionRequestType->setShipTo($shipTo);

    // Hosted payment page settings
    $setting1 = new AnetAPI\SettingType();
    $setting1->setSettingName("hostedPaymentReturnOptions");
    $setting1->setSettingValue(json_encode([
        "showReceipt" => true,
        "url" => "http://localhost/sikars/thankyou.html",
        "urlText" => "Return to Sikars",
        "cancelUrl" => "http://localhost/sikars/",
        "cancelUrlText" => "Cancel"
    ]));

    $request = new AnetAPI\GetHostedPaymentPageRequest();
    $request->setMerchantAuthentication($merchantAuthentication);
    $request->setTransactionRequest($transactionRequestType);
    $request->addToHostedPaymentSettings($setting1);

    $controller = new AnetController\GetHostedPaymentPageController($request);
    $response = $controller->executeWithApiResponse(
        $SANDBOX ? \net\authorize\api\constants\ANetEnvironment::SANDBOX
                 : \net\authorize\api\constants\ANetEnvironment::PRODUCTION
    );

    if ($response && $response->getMessages()->getResultCode() == "Ok") {
        $token = $response->getToken();
        echo json_encode(["url" => "https://accept.authorize.net/payment/payment/" . $token]);
    } else {
        echo json_encode(["error" => "Authorize.Net session failed"]);
    }

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
