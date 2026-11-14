import * as THREE from "three";
import { products, shopConfig } from "./products.js";
import "./styles.css";

const $ = (id) => document.getElementById(id);
let selected = products[0];
let quantity = 1;
let cartCount = 0;
let lidOpen = false;
let scene, camera, renderer, jarGroup, lidPivot, animationId;
const viewer = $("viewer");

function init3D() {
  try {
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#f4e5e9");
    camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 1.5, 7.8);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.25;
    viewer.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff5f7, 0x80536a, 2.0));
    const key = new THREE.DirectionalLight(0xffffff, 3.2);
    key.position.set(4, 7, 6);
    scene.add(key);
    const rim = new THREE.DirectionalLight(0xffb6d0, 2.4);
    rim.position.set(-5, 3, -4);
    scene.add(rim);
    const fill = new THREE.PointLight(0xffffff, 35, 20);
    fill.position.set(0, 1, 5);
    scene.add(fill);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(4.5, 64),
      new THREE.MeshStandardMaterial({ color: "#efd6df", roughness: 0.85 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -1.25;
    scene.add(floor);

    jarGroup = new THREE.Group();
    scene.add(jarGroup);

    const glass = new THREE.MeshPhysicalMaterial({
      color: selected.color, roughness: 0.16, metalness: 0.03,
      transmission: 0.38, thickness: 0.55, transparent: true, opacity: 0.88,
      clearcoat: 1, clearcoatRoughness: 0.08
    });
    const body = new THREE.Mesh(new THREE.CylinderGeometry(1.22, 1.12, 2.15, 96, 1, false), glass);
    body.position.y = -0.05;
    jarGroup.add(body);

    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(1.12, 1.12, 0.12, 96),
      new THREE.MeshStandardMaterial({ color: "#d94e87", roughness: 0.25, metalness: 0.08 })
    );
    base.position.y = -1.16;
    jarGroup.add(base);

    const contents = new THREE.Mesh(
      new THREE.CylinderGeometry(1.08, 1.04, 1.12, 96),
      new THREE.MeshStandardMaterial({ color: "#ef9abb", roughness: 0.38, metalness: 0.02 })
    );
    contents.position.y = -0.48;
    jarGroup.add(contents);

    const gold = new THREE.MeshStandardMaterial({ color: "#c49a4b", metalness: 0.78, roughness: 0.24 });
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(1.17, 1.17, 0.16, 96), gold);
    neck.position.y = 1.06;
    jarGroup.add(neck);

    const label = new THREE.Mesh(
      new THREE.CylinderGeometry(1.232, 1.232, 0.9, 96, 1, true, 0, Math.PI * 2),
      new THREE.MeshStandardMaterial({ color: "#171316", roughness: 0.42, side: THREE.DoubleSide })
    );
    label.position.y = 0.03;
    jarGroup.add(label);

    // Front-facing label plate and typography remain separate from the glass shell.
    const plate = new THREE.Mesh(
      new THREE.PlaneGeometry(1.62, 0.76),
      new THREE.MeshStandardMaterial({ color: "#171316", roughness: 0.4 })
    );
    plate.position.set(0, 0.03, 1.235);
    jarGroup.add(plate);

    const lidMaterial = new THREE.MeshStandardMaterial({ color: "#171316", roughness: 0.28, metalness: 0.12 });
    lidPivot = new THREE.Group();
    lidPivot.position.set(0, 1.16, 0);
    jarGroup.add(lidPivot);
    const lid = new THREE.Mesh(new THREE.CylinderGeometry(1.25, 1.25, 0.28, 96), lidMaterial);
    lid.position.y = 0.13;
    lidPivot.add(lid);
    const lidTrim = new THREE.Mesh(new THREE.CylinderGeometry(1.255, 1.255, 0.045, 96), gold);
    lidTrim.position.y = 0.0;
    lidPivot.add(lidTrim);
    const lidTop = new THREE.Mesh(new THREE.CylinderGeometry(1.18, 1.18, 0.035, 96), lidMaterial);
    lidTop.position.y = 0.285;
    lidPivot.add(lidTop);

    const ring = new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.035, 12, 96), gold);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = -1.19;
    jarGroup.add(ring);

    const resize = () => {
      const width = Math.max(viewer.clientWidth, 1);
      const height = Math.max(viewer.clientHeight, 1);
      camera.aspect = width / height;
      camera.position.z = width < 520 ? 9.1 : 7.8;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
    };
    new ResizeObserver(resize).observe(viewer);
    resize();

    let dragging = false, previousX = 0, previousY = 0;
    renderer.domElement.addEventListener("pointerdown", (event) => {
      dragging = true; previousX = event.clientX; previousY = event.clientY;
      renderer.domElement.setPointerCapture(event.pointerId);
    });
    renderer.domElement.addEventListener("pointermove", (event) => {
      if (!dragging) return;
      jarGroup.rotation.y += (event.clientX - previousX) * 0.009;
      jarGroup.rotation.x = THREE.MathUtils.clamp(jarGroup.rotation.x + (event.clientY - previousY) * 0.004, -0.38, 0.38);
      previousX = event.clientX; previousY = event.clientY;
    });
    const stopDrag = () => { dragging = false; };
    renderer.domElement.addEventListener("pointerup", stopDrag);
    renderer.domElement.addEventListener("pointercancel", stopDrag);
    renderer.domElement.addEventListener("wheel", (event) => {
      event.preventDefault();
      camera.position.z = THREE.MathUtils.clamp(camera.position.z + event.deltaY * 0.008, 5.8, 11);
    }, { passive: false });

    const clock = new THREE.Clock();
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      const target = lidOpen ? -1.18 : 0;
      lidPivot.rotation.z += (target - lidPivot.rotation.z) * 0.09;
      renderer.render(scene, camera);
    };
    animate();
    $("open-lid").addEventListener("click", () => {
      lidOpen = !lidOpen;
      $("open-lid").textContent = lidOpen ? "Fermer le couvercle" : "Ouvrir le couvercle";
    });
    $("reset-view").addEventListener("click", () => {
      jarGroup.rotation.set(0, 0, 0);
      camera.position.set(0, 1.5, window.innerWidth < 520 ? 9.1 : 7.8);
      lidOpen = false;
      $("open-lid").textContent = "Ouvrir le couvercle";
    });
  } catch (error) {
    console.error("3D viewer initialization failed:", error);
    viewer.innerHTML = '<div class="fallback">Aperçu 3D indisponible sur cet appareil. Vous pouvez toujours consulter les informations du produit ci-dessous.</div>';
  }
}

function renderProduct() {
  $("product-name").textContent = selected.name;
  $("product-volume").textContent = selected.size;
  $("product-description").textContent = selected.description;
  $("product-price").textContent = selected.price == null ? "Prix à confirmer" : new Intl.NumberFormat("fr-FR").format(selected.price) + " " + shopConfig.currency;
  $("add-cart").disabled = selected.status === "placeholder";
  $("add-cart").textContent = selected.status === "placeholder" ? "Produit à confirmer" : "Ajouter au panier";
  document.querySelectorAll(".product-card").forEach((card) => card.classList.toggle("active", card.dataset.id === selected.id));
}

function renderCatalogue() {
  $("product-list").innerHTML = products.map((product, index) => `
    <button class="product-card ${index === 0 ? "active" : ""}" data-id="${product.id}" type="button">
      <span class="mini-jar" style="--jar-color:${product.color}"><i></i></span>
      <span class="card-number">0${index + 1}</span>
      <strong>${product.name}</strong>
      <small>${product.status === "placeholder" ? "Bientôt disponible · à confirmer" : product.size}</small>
    </button>`).join("");
  $("product-list").addEventListener("click", (event) => {
    const card = event.target.closest(".product-card");
    if (!card) return;
    selected = products.find((item) => item.id === card.dataset.id) || products[0];
    renderProduct();
  });
}

$("qty-minus").addEventListener("click", () => { quantity = Math.max(1, quantity - 1); $("quantity").textContent = quantity; });
$("qty-plus").addEventListener("click", () => { quantity = Math.min(99, quantity + 1); $("quantity").textContent = quantity; });
$("add-cart").addEventListener("click", () => {
  if (selected.status === "placeholder") return;
  cartCount += quantity;
  $("cart-count").textContent = cartCount;
  $("cart-button").setAttribute("aria-label", `Panier, ${cartCount} article(s)`);
  $("add-cart").textContent = "Ajouté au panier ✓";
  setTimeout(() => { $("add-cart").textContent = "Ajouter au panier"; }, 1400);
});
$("cart-button").addEventListener("click", () => {
  if (!cartCount) { alert("Votre panier est vide."); return; }
  if (!shopConfig.whatsappNumber) {
    alert("Le numéro WhatsApp de la vendeuse doit être configuré avant de finaliser la commande.");
    return;
  }
  const message = encodeURIComponent(`Bonjour, je souhaite commander : ${selected.name} (${selected.size}), quantité : ${cartCount}. Merci de me confirmer le prix et la disponibilité.`);
  window.open(`https://wa.me/${shopConfig.whatsappNumber}?text=${message}`, "_blank", "noopener,noreferrer");
});

renderCatalogue();
renderProduct();
init3D();
