// Seller-confirmed product data belongs here. Unconfirmed details stay explicit.
export const products = [
  {
    id: "savon-nettoyant",
    name: "Savon Nettoyant",
    size: "350 ml",
    price: null,
    description: "Un produit de la collection MA JOLIE BEAUTÉ. Description détaillée à confirmer auprès de la vendeuse.",
    status: "confirmed-name-size",
    color: "#e85a91"
  },
  { id: "product-2", name: "Produit à présenter", size: "Format à confirmer", price: null, description: "Informations à confirmer auprès de la vendeuse.", status: "placeholder", color: "#bd4776" },
  { id: "product-3", name: "Produit à présenter", size: "Format à confirmer", price: null, description: "Informations à confirmer auprès de la vendeuse.", status: "placeholder", color: "#d98a9f" },
  { id: "product-4", name: "Produit à présenter", size: "Format à confirmer", price: null, description: "Informations à confirmer auprès de la vendeuse.", status: "placeholder", color: "#a94a70" },
  { id: "product-5", name: "Produit à présenter", size: "Format à confirmer", price: null, description: "Informations à confirmer auprès de la vendeuse.", status: "placeholder", color: "#edb1c4" }
];

export const shopConfig = {
  whatsappNumber: "", // International format, digits only. Configure after seller confirms.
  currency: "FCFA"
};
