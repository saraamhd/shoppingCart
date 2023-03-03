/////////////////// global code ///////////////////
///////////////////// HEADER /////////////////////
let header = document.querySelector(".header");
let searchInput = document.querySelector(".search-form input[type=search]");
let searchIcon = document.querySelector(".search-icon input[type=submit]");
let products = [];
let shoppingBag = [];
let total = 0;

// localStorage.removeItem("bagItem");

if (localStorage.getItem("bagItem")) {
  shoppingBag = JSON.parse(localStorage.getItem("bagItem"));
}

////////// change header background when scrolling ///////////
window.onscroll = function () {
  if (scrollY > 50) {
    header.classList.add("active");
  } else {
    header.classList.remove("active");
  }
};

///////////////// home page /////////////////
if (!document.querySelector(".shopping-main")) {
  let cartIcon = document.querySelector(".cart-icon");
  let cartCnt = document.querySelector(".cart-icon span");
  let productParent = document.querySelector(".products-content .row");

  cartCnt.innerHTML = `(${shoppingBag.length})`;
  searchIcon.addEventListener("click", (e) => {
    e.preventDefault();
    searchFunc();
  });

  // all product ==> https://api.escuelajs.co/api/v1/products
  async function postData() {
    const res = await fetch("https://fakestoreapi.com/products/");
    const data = await res.json();
    data.forEach((el) => {
      let productItem = {
        id: el.id,
        img: el.image,
        name: el.category,
        des: el.description,
        price: el.price,
        count: 1,
      };
      products.push(productItem);
      createProducts(products);
    });
    //////////////// add items to shopping bag ////////////////////
    let productCartIcon = productParent.querySelectorAll(".card .add-cart");
    let cnt = shoppingBag.length;
    productCartIcon.forEach((el) => {
      el.addEventListener("click", () => {
        let clickedItemId = el.parentElement.parentElement.parentElement.id;
        shoppingItem = products.filter((el) => el.id == clickedItemId);
        let exsit = shoppingBag.find((el) => el.id == clickedItemId);
        if (exsit) {
          shoppingBag.map((bagItem) =>
            bagItem.id == clickedItemId ? bagItem.count++ : bagItem.count
          );
        } else {
          shoppingBag.push(...shoppingItem);
        }
        cnt++;
        cartCnt.innerHTML = `(${cnt})`;
        addItemsToLocal(shoppingBag);
      });
    });
  }

  /////////// create products and add them to page ////////////
  function createProducts(products) {
    productParent.innerHTML = "";
    products.forEach((prod) => {
      productParent.innerHTML += `
          <div class="col-md-6 col-lg-3 mb-4">
              <div class="col-content card position-relative" id="${prod.id}">
                <div class="heart-icon position-absolute">
                  <i class="fa-regular fa-heart"></i>
                </div>
                <div class="card-img-top">
                  <img
                    src="${prod.img}"
                    alt="">
                </div>
                <div class="card-body">
                  <h3 class="card-title">${prod.name}</h3>
                  <p class="card-text">
                    ${prod.des}
                  </p>
                  <div class="d-flex justify-content-between align-items-center">
                    <p class="p-price d-flex gap-1 align-items-center">
                      <span class="price">${prod.price}</span>
                      <span>$</span>
                    </p>
                    <button class="btn add-cart">
                      <i class="fa-solid fa-cart-shopping"></i>
                    </button>
                  </div>
                </div>
              </div>
          </div>
      `;
    });
  }

  ////////////// search products ////////////////
  searchInput.addEventListener("input", searchFunc);
  function searchFunc() {
    if (searchInput.value.trim() != "") {
      let productsArr = products.filter((el) =>
        el.name.toLowerCase().includes(searchInput.value.toLowerCase())
      );
      createProducts(productsArr);
    } else {
      createProducts(products);
    }
  }

  postData();

  cartIcon.addEventListener("click", () => {
    window.location.href = "shoppingBag.html";
  });
} else {
  /////////// shopping bag page ////////////
  let bagTableBody = document.querySelector(".shopping-main tbody");
  let totalElement = document.querySelector(".total .total-price");
  let checkoutBtn = document.querySelector(".total .checkout");

  if (localStorage.getItem("bagItem")) createShoppingItems();

  function createShoppingItems() {
    let items = JSON.parse(localStorage.getItem("bagItem"));
    bagTableBody.innerHTML = "";
    items.forEach((item, idx) => {
      bagTableBody.innerHTML += `
      <tr id="${item.id}">
          <td>
              <div class="icon-x">
                  <i class="fa-solid fa-x"></i>
              </div>
          </td>
          <td>
              <div class="img">
                  <img src="${item.img}" alt="">
              </div>
          </td>
          <td>
              <h5>${item.name}</h5>
          </td>
          <td>
              <div class="counter d-flex">
                  <button class="btn plus">+</button>
                  <input type="number" value="${item.count}" min="1" max="100">
                  <button class="btn min">-</button>
              </div>
          </td>
          <td>
              <p class="price text-black-50">${item.price}</p>
          </td>
      </tr>
      `;
    });
  }

  let plus = bagTableBody.querySelectorAll(".plus");
  let minus = bagTableBody.querySelectorAll(".min");
  let input = bagTableBody.querySelectorAll("input[type=number]");

  plus.forEach((el, idx) => {
    el.addEventListener("click", () => {
      input[idx].value++;
      shoppingBag[idx].count = input[idx].value;
      countTotal(shoppingBag);
    });
  });
  minus.forEach((el, idx) => {
    el.addEventListener("click", () => {
      if (input[idx].value <= 1) {
        input[idx].value = 1;
      } else {
        input[idx].value--;
      }
      shoppingBag[idx].count = input[idx].value;
      countTotal(shoppingBag);
    });
  });

  countTotal(shoppingBag);
  function countTotal(shoppingBag) {
    total = 0;
    if (shoppingBag.length > 0) {
      shoppingBag.forEach((el) => {
        total += el.price * el.count;
        totalElement.innerHTML = `$${total.toFixed(2)}`;
      });
    } else {
      totalElement.innerHTML = `$0`;
    }
  }

  let xIcon = Array.from(bagTableBody.querySelectorAll(".icon-x"));

  xIcon.forEach((el) => {
    el.addEventListener("click", () => {
      let parent = el.parentElement.parentElement;
      shoppingBag.map((el, idx) => {
        if (el.id == parent.id) {
          if (el.count > 1) {
            el.count--;
            countTotal(shoppingBag);
            input[idx].value--;
          } else {
            el.count;
            removeItemFromLocal(parent.id);
            parent.remove();
          }
        }
      });
      addItemsToLocal(shoppingBag);
    });
  });

  //////////////// checkout ////////////////
  checkoutBtn.addEventListener("click", () => {
    localStorage.removeItem("bagItem");
    bagTableBody.innerHTML = "";
    totalElement.innerHTML = `$0`;
  });
}

/////////////// add products to local storage ////////////////

function addItemsToLocal(shoppingBag) {
  localStorage.setItem("bagItem", JSON.stringify(shoppingBag));
}

function removeItemFromLocal(id) {
  shoppingBag = shoppingBag.filter((ele) => ele.id != id);
  addItemsToLocal(shoppingBag);
  countTotal(shoppingBag);
}
