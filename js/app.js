console.log('Wizard loaded');

async function checkout() {
  const order = {
    size: document.querySelector('input[name="size"]:checked')?.value,
    box: document.querySelector('input[name="box"]:checked')?.value,
    binder: document.querySelector('input[name="binder"]:checked')?.value,
    flavor: document.querySelector('input[name="flavor"]:checked')?.value,
    engraving: document.getElementById("engraving")?.value || "",
    bandStyle: document.getElementById("bandStyle")?.value || "",
    bandText: document.getElementById("bandText")?.value || "",
    quantity: Number(document.getElementById("qty")?.value) || 1,
    price: Number(document.getElementById("priceVal")?.value) || 0
  };

  const res = await fetch("api/create-session.php", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(order)
  });
  const data = await res.json();
  if (data.url) {
    window.location.href = data.url;
  } else {
    alert("Payment session failed");
  }
}
