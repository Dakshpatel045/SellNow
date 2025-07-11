$(document).ready(function () {
  // Global modal focus management to prevent ARIA-hidden warnings
  $(".modal").on("hidden.bs.modal", function () {
    const activeElement = document.activeElement;
    if (activeElement && $(this).has(activeElement).length) {
      activeElement.blur();
    }
    $("body").focus();
  });

  // Load header and footer
  $("#header").load("header.html", function () {
    $("#footer").load("footer.html");
      function setActiveNavLink() {
  const currentPage = window.location.pathname.split("/").pop().split("?")[0] || "index.html";
  // Target all nav-links in both navbar-nav lists
  $(".navbar-nav .nav-link").removeClass("active");
  $(".navbar-nav .nav-link").each(function () {
    const href = $(this).attr("href")?.split("?")[0]; // Strip query parameters from href
    if (href && (href === currentPage || (currentPage === "" && href === "index.html"))) {
      $(this).addClass("active");
    }
  });
}

    setActiveNavLink();
    $("#authModal").on("shown.bs.modal", function () {
      $("#loginForm")[0].reset();
      $("#signupForm")[0].reset();
      $(".text-danger").addClass("d-none");
      // showForm("login");
      $("#loginEmail").focus();
    });

    function showForm(formType) {
      $(".auth-form").addClass("d-none");
      $(".btn-darks").removeClass("active");
      if (formType === "login") {
        $("#login-form").removeClass("d-none");
        // $(".btn-darks:contains('Login')").addClass("active");
        $("#loginBtn").addClass("active");
      } else {
        $("#signup-form").removeClass("d-none");
        // $(".btn-darks:contains('Signup')").addClass("active");
        $("#signupBtn").addClass("active");
      }
    }

    function isValidEmail(email) {
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }

    function checkLoginStatus() {
      let currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (currentUser) {
        $(".nav-login").addClass("d-none");
        $(".nav-logout").removeClass("d-none");
        $("#logoutText").text(`Logout (${currentUser.name} - ${currentUser.role})`);
        if (currentUser.role === "seller") {
          $(".nav-post-product").removeClass("d-none");
        } else {
          $(".nav-post-product").addClass("d-none");
        }
      } else {
        $(".nav-login").removeClass("d-none");
        $(".nav-logout").addClass("d-none");
        $(".nav-post-product").addClass("d-none");
        $("#logoutText").text("Logout");
      }
    }

    $(document).on("click", ".btn-darks", function () {
      const type = $(this).text().trim().toLowerCase();
      showForm(type);
    });

    $(document).on("click", ".nav-login a[data-form]", function () {
      const formType = $(this).data("form");
      showForm(formType);
    });

    $(document).on("submit", "#loginForm", function (e) {
  e.preventDefault();
  const $form = $(this);
  let isValid = true;

  $form.find("input").each(function () {
    const $input = $(this);
    const $error = $input.next(".invalid-feedback");
    const id = $input.attr("id");
    let fieldValid = true;

    if (id === "loginEmail") {
      fieldValid = isValidEmail($input.val().trim());
      $error.text(fieldValid ? "" : "Invalid email");
    } else if (id === "loginPassword") {
      fieldValid = $input.val().trim().length >= 6;
      $error.text(fieldValid ? "" : "Password must be at least 6 characters");
    }

    $input.toggleClass("is-invalid", !fieldValid);
    $error.toggleClass("d-block", !fieldValid).toggleClass("d-none", fieldValid);
    if (!fieldValid) isValid = false;
  });

  if (!isValid) {
    Swal.fire({
      title: "Error",
      text: "Please fix the errors in the form.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const email = $("#loginEmail").val().trim();
  const password = $("#loginPassword").val().trim();
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    localStorage.setItem("currentUser", JSON.stringify(user));
    $("#authModal").modal("hide");
    Swal.fire({
      title: "Success!",
      text: "Login successful!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });
    checkLoginStatus();
  } else {
    $("#loginEmailError").text("Invalid email or password").removeClass("d-none").addClass("d-block");
    $("#loginEmail").addClass("is-invalid");
  }
});
    $(document).on("submit", "#signupForm", function (e) {
  e.preventDefault();
  const $form = $(this);
  let isValid = true;

  $form.find("input, select").each(function () {
    const $input = $(this);
    const $error = $input.next(".invalid-feedback");
    const id = $input.attr("id");
    let fieldValid = true;

    if (id === "signupName") {
      fieldValid = $input.val().trim() !== "";
      $error.text(fieldValid ? "" : "Name is required");
    } else if (id === "signupEmail") {
      const email = $input.val().trim();
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      fieldValid = isValidEmail(email) && !users.some((u) => u.email === email);
      $error.text(fieldValid ? "" : isValidEmail(email) ? "Email already exists" : "Invalid email");
    } else if (id === "signupPassword") {
      fieldValid = $input.val().trim().length >= 6;
      $error.text(fieldValid ? "" : "Password must be at least 6 characters");
    } else if (id === "userRole") {
      fieldValid = $input.val() !== "";
      $error.text(fieldValid ? "" : "Please select a role");
    }

    $input.toggleClass("is-invalid", !fieldValid);
    $error.toggleClass("d-block", !fieldValid).toggleClass("d-none", fieldValid);
    if (!fieldValid) isValid = false;
  });

  if (!isValid) {
    Swal.fire({
      title: "Error",
      text: "Please fix the errors in the form.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const name = $("#signupName").val().trim();
  const email = $("#signupEmail").val().trim();
  const password = $("#signupPassword").val().trim();
  const role = $("#userRole").val();
  const users = JSON.parse(localStorage.getItem("users") || "[]");
  const newUser = { id: Date.now(), name, email, password, role };
  users.push(newUser);
  localStorage.setItem("users", JSON.stringify(users));
  localStorage.setItem("currentUser", JSON.stringify(newUser));
  $("#authModal").modal("hide");
  Swal.fire({
    title: "Success!",
    text: "Signup successful!",
    icon: "success",
    timer: 1500,
    showConfirmButton: false
  });
  checkLoginStatus();
});

    $(document).on("click", "#logoutLink", function (e) {
      e.preventDefault();
      Swal.fire({
        title: "Logout?",
        text: "Are you sure you want to logout?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Logout"
      }).then((result) => {
        if (result.isConfirmed) {
          localStorage.removeItem("currentUser");
          checkLoginStatus();
          Swal.fire({
            title: "Success!",
            text: "Logged out successfully!",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
          window.location.href = "index.html";
        }
      });
    });

    checkLoginStatus();
  });

  // POST PRODUCT PAGE LOGIC
  if ($("#postProductForm").length > 0) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "seller") {
      Swal.fire({
        title: "Access Denied",
        text: "Only sellers can post products. Redirecting to Home.",
        icon: "error",
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "index.html";
      });
    }

    function loadSellerProducts() {
      let products = JSON.parse(localStorage.getItem("products") || "[]");
      let sellerProducts = products.filter((p) => p.sellerId === currentUser.id);
      let $list = $("#sellerProductList");
      $list.empty();

      if (sellerProducts.length === 0) {
        $list.html("<p class='text-center'>You have not posted any products yet.</p>");
        return;
      }

      sellerProducts.forEach((product) => {
        $list.append(`
          <div class="col-md-4 mb-3">
              <div class="card h-100 shadow-sm">
                  <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                  <div class="card-body d-flex flex-column">
                      <h5 class="card-title">${product.title}</h5>
                      <p class="card-text mb-1">Price: ₹${product.price}</p>
                      <p class="card-text mb-1">Category: ${product.category}</p>
                      <p class="card-text mb-2">City: ${product.city}, ${product.state}</p>
                      <div class="mt-auto d-flex justify-content-between">
                          <button class="btn btn-sm btn-secondary view-chat-btn" data-id="${product.id}">
                              <i class="bi bi-chat-dots"></i> View Chats
                          </button>
                          <button class="btn btn-sm btn-primary edit-product-btn" data-id="${product.id}">
                              <i class="bi bi-pencil"></i> Edit
                          </button>
                          <button class="btn btn-sm btn-danger delete-product-btn" data-id="${product.id}">
                              <i class="bi bi-trash"></i> Delete
                          </button>
                      </div>
                  </div>
              </div>
          </div>
        `);
      });
    }

    loadSellerProducts();

    $("#postProductForm").off("submit").on("submit", function (e) {
  e.preventDefault();
  const $form = $(this);
  let isValid = true;

  $form.find("input, select, textarea").each(function () {
    const $input = $(this);
    const $error = $input.next(".invalid-feedback");
    const id = $input.attr("id");
    let fieldValid = true;

    if (id === "productTitle" || id === "productCity" || id === "productState") {
      fieldValid = $input.val().trim() !== "";
      $error.text(fieldValid ? "" : `${$input.prev("label").text()} is required.`);
    } else if (id === "productDescription") {
      fieldValid = $input.val().trim() !== "";
      $error.text(fieldValid ? "" : "Product description is required.");
    } else if (id === "productPrice") {
      const price = parseFloat($input.val());
      fieldValid = !isNaN(price) && price > 0;
      $error.text(fieldValid ? "" : "Price must be a positive number.");
    } else if (id === "productCategory") {
      fieldValid = $input.val() !== "";
      $error.text(fieldValid ? "" : "Please select a category.");
    } else if (id === "productImage") {
      fieldValid = $input[0].files.length > 0;
      $error.text(fieldValid ? "" : "Please select an image.");
    }

    $input.toggleClass("is-invalid", !fieldValid);
    $error.toggleClass("d-block", !fieldValid).toggleClass("d-none", fieldValid);
    if (!fieldValid) isValid = false;
  });

  if (!isValid) {
    Swal.fire({
      title: "Error",
      text: "Please fix the errors in the form.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const title = $("#productTitle").val().trim();
  const description = $("#productDescription").val().trim();
  const price = parseFloat($("#productPrice").val());
  const category = $("#productCategory").val();
  const city = $("#productCity").val().trim();
  const state = $("#productState").val().trim();
  const imageFile = $("#productImage")[0].files[0];

  const reader = new FileReader();
  reader.onload = function (e) {
    const imageBase64 = e.target.result;
    const products = JSON.parse(localStorage.getItem("products") || "[]");

    const newProduct = {
      id: Date.now(),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
      title,
      description,
      price,
      category,
      city,
      state,
      image: imageBase64,
      datePosted: new Date().toISOString(),
    };

    products.push(newProduct);
    localStorage.setItem("products", JSON.stringify(products));

    Swal.fire({
      title: "Success!",
      text: "Product posted successfully!",
      icon: "success",
      timer: 1500,
      showConfirmButton: false
    });
    $("#postProductForm")[0].reset();
    $form.find(".is-invalid").removeClass("is-invalid");
    $form.find(".invalid-feedback").addClass("d-none").removeClass("d-block");
    loadSellerProducts();
  };
  reader.readAsDataURL(imageFile);
});
    $(document).on("click", ".edit-product-btn", function () {
      const productId = $(this).data("id");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const product = products.find((p) => p.id === productId);

      if (product) {
        $("#editProductId").val(product.id);
        $("#editProductTitle").val(product.title);
        $("#editProductDescription").val(product.description);
        $("#editProductPrice").val(product.price);
        $("#editProductCategory").val(product.category);
        $("#editProductCity").val(product.city);
        $("#editProductState").val(product.state);
        $("#editProductImage").val("");
        $("#editProductModal").modal("show");
        $("#editProductModal").on("shown.bs.modal", function () {
          $("#editProductTitle").focus();
        });
      }
    });

    // Update editProductForm submission to check validations
$("#editProductForm").off("submit").on("submit", function (e) {
  e.preventDefault();
  const $form = $(this);
  let isValid = true;

  $form.find("input, textarea").each(function () {
    const $input = $(this);
    const $error = $input.next(".invalid-feedback");
    const id = $input.attr("id");
    let fieldValid = true;

    if (id === "editProductTitle" || id === "editProductCity" || id === "editProductState" || id === "editProductCategory") {
      fieldValid = $input.val().trim() !== "";
      $error.text(fieldValid ? "" : `${$input.prev("label").text()} is required.`);
    } else if (id === "editProductDescription") {
      fieldValid = $input.val().trim() !== "";
      $error.text(fieldValid ? "" : "Product description is required.");
    } else if (id === "editProductPrice") {
      const price = parseFloat($input.val());
      fieldValid = !isNaN(price) && price > 0;
      $error.text(fieldValid ? "" : "Price must be a positive number.");
    }

    $input.toggleClass("is-invalid", !fieldValid);
    $error.toggleClass("d-block", !fieldValid).toggleClass("d-none", fieldValid);
    if (!fieldValid) isValid = false;
  });

  if (!isValid) {
    Swal.fire({
      title: "Error",
      text: "Please fix the errors in the form.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const productId = parseInt($("#editProductId").val());
  const products = JSON.parse(localStorage.getItem("products") || "[]");
  const productIndex = products.findIndex((p) => p.id === productId);

  if (productIndex !== -1) {
    const product = products[productIndex];
    product.title = $("#editProductTitle").val().trim();
    product.description = $("#editProductDescription").val().trim();
    product.price = parseFloat($("#editProductPrice").val());
    product.category = $("#editProductCategory").val().trim();
    product.city = $("#editProductCity").val().trim();
    product.state = $("#editProductState").val().trim();

    const newImageFile = $("#editProductImage")[0].files[0];
    if (newImageFile) {
      const reader = new FileReader();
      reader.onload = function (e) {
        product.image = e.target.result;
        products[productIndex] = product;
        localStorage.setItem("products", JSON.stringify(products));
        $("#editProductModal").modal("hide");
        loadSellerProducts();
        Swal.fire({
          title: "Success!",
          text: "Product updated successfully!",
          icon: "success",
          timer: 1500,
          showConfirmButton: false
        });
      };
      reader.readAsDataURL(newImageFile);
    } else {
      products[productIndex] = product;
      localStorage.setItem("products", JSON.stringify(products));
      $("#editProductModal").modal("hide");
      loadSellerProducts();
      Swal.fire({
        title: "Success!",
        text: "Product updated successfully!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false
      });
    }
  }
});
    $(document).on("click", ".delete-product-btn", function () {
      const productId = $(this).data("id");
      Swal.fire({
        title: "Delete Product?",
        text: "Are you sure you want to delete this product? All related requests will be rejected.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Delete"
      }).then((result) => {
        if (result.isConfirmed) {
          const products = JSON.parse(localStorage.getItem("products") || "[]");
          const requests = JSON.parse(localStorage.getItem("requests") || "[]");
          const updatedProducts = products.filter((p) => p.id !== productId);
          const updatedRequests = requests.map((r) =>
            r.productId === productId && r.status === "Requested"
              ? { ...r, status: "Rejected" }
              : r
          );
          localStorage.setItem("products", JSON.stringify(updatedProducts));
          localStorage.setItem("requests", JSON.stringify(updatedRequests));
          loadSellerProducts();
          Swal.fire({
            title: "Deleted!",
            text: "Product deleted successfully! All related requests have been rejected.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
        }
      });
    });

    $(document).on("click", ".view-chat-btn", function () {
      const productId = $(this).data("id");
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      $("#buyerSelectContainer").remove();

      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter((key) => key.startsWith(`chat_`) && key.endsWith(`_${productId}`));

      if (chatKeys.length === 0) {
        Swal.fire({
          title: "No Chats",
          text: "No chats from buyers for this product yet.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      const buyers = new Set();
      const buyerDetails = new Map();
      chatKeys.forEach((key) => {
        const parts = key.split("_");
        const buyerId = parseInt(parts[1]);
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const buyer = users.find((u) => u.id === buyerId);
        if (buyer) {
          buyers.add(buyerId);
          buyerDetails.set(buyerId, buyer);
        }
      });

      if (buyers.size === 0) {
        Swal.fire({
          title: "No Chats",
          text: "No valid buyer chats found for this product.",
          icon: "info",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      let buyerSelectHtml = `
        <div id="buyerSelectContainer" class="mb-3">
          <label for="buyerSelect" class="form-label">Select Buyer:</label>
          <select id="buyerSelect" class="form-select">
            <option value="">Select a buyer</option>
      `;
      buyers.forEach((buyerId) => {
        const buyer = buyerDetails.get(buyerId);
        buyerSelectHtml += `<option value="${buyerId}">${buyer.name} (${buyer.email})</option>`;
      });
      buyerSelectHtml += "</select></div>";

      $("#chatModal .modal-body").prepend(buyerSelectHtml);
      $("#chatModal").modal("show");
      $("#chatModal").on("shown.bs.modal", function () {
        $("#buyerSelect").focus();
      });

      $("#buyerSelect").off("change").on("change", function () {
        const buyerId = $(this).val();
        if (buyerId) {
          loadChatMessages(currentUser.id, parseInt(buyerId), productId);
        } else {
          $("#chatMessages").empty();
        }
      });

      $("#sendChatBtn").off("click").on("click", function () {
        const buyerId = $("#buyerSelect").val();
        const message = $("#chatInput").val().trim();

        if (!buyerId) {
          Swal.fire({
            title: "Error",
            text: "Please select a buyer first.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false
          });
          return;
        }
        if (!message) {
          Swal.fire({
            title: "Error",
            text: "Please enter a message.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false
          });
          return;
        }

        const chatKey = `chat_${buyerId}_${currentUser.id}_${productId}`;
        let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");

        chatHistory.push({
          senderId: currentUser.id,
          senderName: currentUser.name,
          message,
          timestamp: new Date().toISOString(),
        });

        localStorage.setItem(chatKey, JSON.stringify(chatHistory));
        $("#chatInput").val("");
        loadChatMessages(currentUser.id, parseInt(buyerId), productId);
      });
    });
  }

  // PRODUCTS PAGE LOGIC
  if ($("#productList").length > 0) {
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const requests = JSON.parse(localStorage.getItem("requests") || "[]");

    const categories = [...new Set(products.map((p) => p.category))];
    const cities = [...new Set(products.map((p) => p.city))];
    const states = [...new Set(products.map((p) => p.state))];

    categories.forEach((c) => {
      $("#filterCategory").append(`<option value="${c}">${c}</option>`);
    });
    cities.forEach((city) => {
      $("#filterCity").append(`<option value="${city}">${city}</option>`);
    });
    states.forEach((state) => {
      $("#filterState").append(`<option value="${state}">${state}</option>`);
    });

    function renderProducts(filter = {}) {
      const { category, city, state, minPrice, maxPrice, name } = filter;
      $("#productList").empty();

      // Filter out products with an accepted request
      const acceptedProductIds = requests
        .filter((r) => r.status === "Accepted")
        .map((r) => r.productId);

      let filteredProducts = products.filter((p) => {
        let match = true;
        if (acceptedProductIds.includes(p.id)) match = false;
        if (category && p.category !== category) match = false;
        if (city && p.city !== city) match = false;
        if (state && p.state !== state) match = false;
        if (minPrice && p.price < parseFloat(minPrice)) match = false;
        if (maxPrice && p.price > parseFloat(maxPrice)) match = false;
        if (name && !p.title.toLowerCase().includes(name.toLowerCase())) match = false;
        return match;
      });

      if (filteredProducts.length === 0) {
        $("#productList").html("<p class='text-center text-muted'>No products found matching the criteria.</p>");
        return;
      }

      filteredProducts.forEach((product) => {
        const card = `
          <div class="col-md-4 mb-3">
              <div class="card h-100 shadow-sm">
                  <img src="${product.image}" class="card-img-top" alt="${product.title}" style="height: 200px; object-fit: cover;">
                  <div class="card-body d-flex flex-column">
                      <h5 class="card-title">${product.title}</h5>
                      <p class="card-text mb-1">Price: ₹${product.price}</p>
                      <p class="card-text mb-1">Seller: ${product.sellerName}</p>
                      <p class="card-text mb-1">Category: ${product.category}</p>
                      <p class="card-text mb-1">City: ${product.city}, ${product.state}</p>
                      <button class="btn  mt-auto view-details-btn" data-id="${product.id}">View Details</button>
                  </div>
              </div>
          </div>
        `;
        $("#productList").append(card);
      });
    }

    renderProducts();

    $("#filterCategory, #filterCity, #filterState, #filterMinPrice, #filterMaxPrice, #filterName").on(
      "input change",
      function () {
        const filter = {
          category: $("#filterCategory").val(),
          city: $("#filterCity").val(),
          state: $("#filterState").val(),
          minPrice: $("#filterMinPrice").val(),
          maxPrice: $("#filterMaxPrice").val(),
          name: $("#filterName").val().trim(),
        };
        renderProducts(filter);
      }
    );

    $(document).on("click", ".view-details-btn", function () {
      const productId = $(this).data("id");
      window.location.href = `product-details.html?id=${productId}`;
    });
  }

  // PRODUCT DETAILS PAGE LOGIC
  if ($("#productDetailsContainer").length > 0) {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get("id"));
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    const product = products.find((p) => p.id === productId);

    if (!product) {
      $("#productDetailsContainer").html("<p class='text-center'>Product not found.</p>");
      return;
    }

    $("#productDetailsContainer").html(`
      <div class="col-md-6 col-lg-5 mx-auto">
          <div class="card shadow-sm rounded-4">
              <img src="${product.image}" class="card-img-top" alt="${product.title}">
              <div class="card-body">
                  <h3 class="card-title">${product.title}</h3>
                  <p class="card-text">${product.description}</p>
                  <p class="card-text fw-semibold">Price: ₹${product.price}</p>
                  <p class="card-text text-muted">
                      <i class="bi bi-person-circle me-1"></i> Seller: ${product.sellerName}
                  </p>
                  <p class="card-text">Category: ${product.category}</p>
                  <p class="card-text">Location: ${product.city}, ${product.state}</p>
                  <button class="btn btn-primary mt-2" id="chatWithSellerBtn">
                      <i class="bi bi-chat-dots me-1"></i> Chat with Seller
                  </button>
                  <button class="btn btn-success mt-2" id="requestToBuyBtn">
                      <i class="bi bi-cart-check me-1"></i> Request to Buy
                  </button>
              </div>
          </div>
      </div>
    `);

    $(document).on("click", "#chatWithSellerBtn", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      if (!currentUser) {
        Swal.fire({
          title: "Login Required",
          text: "Please login to chat with the seller.",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false
        });
        $("#authModal").modal("show");
        $("#authModal").on("shown.bs.modal", function () {
          $("#loginEmail").focus();
        });
        return;
      }
      if (currentUser.id === product.sellerId) {
        Swal.fire({
          title: "Error",
          text: "You cannot chat with yourself!",
          icon: "error",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      $("#chatModal").modal("show");
      $("#chatModal").on("shown.bs.modal", function () {
        $("#chatInput").focus();
      });
      loadChatMessages(product.sellerId, currentUser.id, productId);
    });

    $(document).on("click", "#requestToBuyBtn", function () {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) {
    Swal.fire({
      title: "Login Required",
      text: "Please login to send a purchase request.",
      icon: "warning",
      timer: 2000,
      showConfirmButton: false
    });
    $("#authModal").modal("show");
    $("#authModal").on("shown.bs.modal", function () {
      $("#loginEmail").focus();
    });
    return;
  }
  if (currentUser.id === product.sellerId) {
    Swal.fire({
      title: "Error",
      text: "You cannot request to buy your own product!",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }
  if (currentUser.role !== "buyer") {
    Swal.fire({
      title: "Error",
      text: "Only buyers can send purchase requests.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const requests = JSON.parse(localStorage.getItem("requests") || "[]");
  const existingRequest = requests.find(
    (r) => r.productId === productId && r.buyerId === currentUser.id && r.status === "Requested"
  );
  if (existingRequest) {
    Swal.fire({
      title: "Error",
      text: "You already have a pending request for this product.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const acceptedRequest = requests.find(
    (r) => r.productId === productId && r.status === "Accepted"
  );
  if (acceptedRequest) {
    Swal.fire({
      title: "Error",
      text: "This product has already been sold.",
      icon: "error",
      timer: 2000,
      showConfirmButton: false
    });
    return;
  }

  const newRequest = {
    id: Date.now(),
    productId,
    buyerId: currentUser.id,
    sellerId: product.sellerId,
    price: product.price,
    status: "Requested",
    requestDate: new Date().toISOString(),
  };

  requests.push(newRequest);
  localStorage.setItem("requests", JSON.stringify(requests));
  Swal.fire({
    title: "Success!",
    text: "Purchase request sent successfully! Check My Orders for status.",
    icon: "success",
    timer: 1500,
    showConfirmButton: false
  }).then(() => {
    window.location.href = "orders.html";
  });
});

    $(document).on("click", "#sendChatBtn", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const message = $("#chatInput").val().trim();
      if (!message) {
        Swal.fire({
          title: "Error",
          text: "Please enter a message.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      const buyerId = $("#buyerSelect").val() || currentUser.id;
      const sellerId = currentUser.role === "seller" ? currentUser.id : product.sellerId;
      const chatKey = `chat_${buyerId}_${sellerId}_${productId}`;
      let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");

      chatHistory.push({
        senderId: currentUser.id,
        senderName: currentUser.name,
        message,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem(chatKey, JSON.stringify(chatHistory));
      $("#chatInput").val("");
      loadChatMessages(sellerId, buyerId, productId);
    });

    let chatRefreshInterval;
    $("#chatModal").on("shown.bs.modal", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const buyerId = $("#buyerSelect").val();
      const productIdFromChat = $(".view-chat-btn[data-id]").data("id") || $(".chat-request-btn[data-product-id]").data("product-id") || productId;

      chatRefreshInterval = setInterval(() => {
        if (currentUser && productIdFromChat) {
          if (buyerId) {
            loadChatMessages(currentUser.id, parseInt(buyerId), productIdFromChat);
          } else if (currentUser.role === "buyer") {
            const sellerId = JSON.parse(localStorage.getItem("products") || "[]").find((p) => p.id === productIdFromChat)?.sellerId;
            loadChatMessages(sellerId, currentUser.id, productIdFromChat);
          }
        }
      }, 3000);
    });

    $("#chatModal").on("hidden.bs.modal", function () {
      clearInterval(chatRefreshInterval);
      $("#buyerSelectContainer").remove();
      $("#chatMessages").empty();
      $("#chatInput").val("");
    });
  }

  // ORDERS PAGE LOGIC
  if ($("#buyerOrderList").length > 0 || $("#sellerOrderList").length > 0) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser) {
      Swal.fire({
        title: "Login Required",
        text: "Please login to view orders.",
        icon: "warning",
        timer: 2000,
        showConfirmButton: false
      }).then(() => {
        window.location.href = "index.html";
      });
      return;
    }

    function renderBuyerRequests() {
      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const buyerRequests = requests.filter((r) => r.buyerId === currentUser.id);
      const $list = $("#buyerOrderList");
      $list.empty();

      if (buyerRequests.length === 0) {
        $list.html("<p class='text-center text-muted'>You have not sent any purchase requests yet.</p>");
        return;
      }

      buyerRequests.forEach((request) => {
        const product = products.find((p) => p.id === request.productId);
        const seller = users.find((u) => u.id === request.sellerId);
        if (product && seller) {
          $list.append(`
            <div class="col-md-6 mb-3">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text mb-1">Order ID: ${request.id}</p>
                        <p class="card-text mb-1">Price: ₹${request.price}</p>
                        <p class="card-text mb-1">Seller: ${seller.name} (${seller.email})</p>
                        <p class="card-text mb-1">Status: <span class="badge bg-${getStatusBadge(request.status)}">${request.status}</span></p>
                        <p class="card-text mb-1">Order Date: ${new Date(request.requestDate).toLocaleString()}</p>
                        <button class="btn btn-primary btn-sm mt-2 chat-request-btn" data-product-id="${request.productId}" data-seller-id="${request.sellerId}">
                            <i class="bi bi-chat-dots me-1"></i> Chat with Seller
                        </button>
                    </div>
                </div>
            </div>
          `);
        }
      });
    }

    function renderSellerRequests() {
      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
      const products = JSON.parse(localStorage.getItem("products") || "[]");
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const sellerRequests = requests.filter((r) => r.sellerId === currentUser.id);
      const $list = $("#sellerOrderList");
      $list.empty();

      if (sellerRequests.length === 0) {
        $list.html("<p class='text-center text-muted'>No purchase requests for your products yet.</p>");
        return;
      }

      sellerRequests.forEach((request) => {
        const product = products.find((p) => p.id === request.productId);
        const buyer = users.find((u) => u.id === request.buyerId);
        if (product && buyer) {
          $list.append(`
            <div class="col-md-6 mb-3">
                <div class="card h-100 shadow-sm">
                    <div class="card-body">
                        <h5 class="card-title">${product.title}</h5>
                        <p class="card-text mb-1">Order ID: ${request.id}</p>
                        <p class="card-text mb-1">Price: ₹${request.price}</p>
                        <p class="card-text mb-1">Buyer: ${buyer.name} (${buyer.email})</p>
                        <p class="card-text mb-1">Status: <span class="badge bg-${getStatusBadge(request.status)}">${request.status}</span></p>
                        <p class="card-text mb-1">Order Date: ${new Date(request.requestDate).toLocaleString()}</p>
                        <div class="mt-2">
                            <button class="btn btn-success btn-sm accept-request-btn ${request.status !== 'Requested' ? 'disabled' : ''}" data-request-id="${request.id}">
                                <i class="bi bi-check-circle me-1"></i> Accept
                            </button>
                            <button class="btn btn-danger btn-sm reject-request-btn ${request.status !== 'Requested' ? 'disabled' : ''}" data-request-id="${request.id}">
                                <i class="bi bi-x-circle me-1"></i> Reject
                            </button>
                            <button class="btn btn-primary btn-sm chat-request-btn" data-product-id="${request.productId}" data-buyer-id="${request.buyerId}">
                                <i class="bi bi-chat-dots me-1"></i> Chat
                            </button>
                        </div>
                    </div>
                </div>
            </div>
          `);
        }
      });
    }

    function getStatusBadge(status) {
      switch (status) {
        case "Requested": return "warning";
        case "Accepted": return "success";
        case "Rejected": return "danger";
        default: return "secondary";
      }
    }

    if (currentUser.role === "buyer") {
      $("#seller-orders-tab").addClass("d-none");
      renderBuyerRequests();
    } else if (currentUser.role === "seller") {
      $("#buyer-orders-tab").addClass("d-none");
      renderSellerRequests();
    } else {
      renderBuyerRequests();
      renderSellerRequests();
    }

    $(document).on("click", ".accept-request-btn", function () {
      const requestId = parseInt($(this).data("request-id"));
      Swal.fire({
        title: "Accept Request?",
        text: "This will accept the request and reject others for this product.",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Accept"
      }).then((result) => {
        if (result.isConfirmed) {
          const requests = JSON.parse(localStorage.getItem("requests") || "[]");
          const request = requests.find((r) => r.id === requestId);
          if (!request || request.status !== "Requested") return;
          const productRequests = requests.filter((r) => r.productId === request.productId);
          productRequests.forEach((r) => {
            if (r.id === requestId) r.status = "Accepted";
            else if (r.status === "Requested") r.status = "Rejected";
          });
          localStorage.setItem("requests", JSON.stringify(requests));
          Swal.fire({
            title: "Accepted!",
            text: "Request accepted successfully.",
            icon: "success",
            timer: 1500,
            showConfirmButton: false
          });
          renderSellerRequests();
        }
      });
    });

    $(document).on("click", ".reject-request-btn", function () {
      const requestId = parseInt($(this).data("request-id"));
      Swal.fire({
        title: "Reject Request?",
        text: "This will reject the buyer's request.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Reject"
      }).then((result) => {
        if (result.isConfirmed) {
          const requests = JSON.parse(localStorage.getItem("requests") || "[]");
          const requestIndex = requests.findIndex((r) => r.id === requestId);
          if (requestIndex !== -1 && requests[requestIndex].status === "Requested") {
            requests[requestIndex].status = "Rejected";
            localStorage.setItem("requests", JSON.stringify(requests));
            Swal.fire({
              title: "Rejected!",
              text: "Request rejected successfully.",
              icon: "success",
              timer: 1500,
              showConfirmButton: false
            });
            renderSellerRequests();
          }
        }
      });
    });

    $(document).on("click", ".chat-request-btn", function () {
      const productId = parseInt($(this).data("product-id"));
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const buyerId = parseInt($(this).data("buyer-id"));
      const sellerId = parseInt($(this).data("seller-id"));

      if (!currentUser) {
        Swal.fire({
          title: "Login Required",
          text: "Please login to start a chat.",
          icon: "warning",
          timer: 2000,
          showConfirmButton: false
        });
        $("#authModal").modal("show");
        $("#authModal").on("shown.bs.modal", function () {
          $("#loginEmail").focus();
        });
        return;
      }
      if (!productId || (!buyerId && !sellerId)) {
        Swal.fire({
          title: "Error",
          text: "Unable to start chat. Missing user or product information.",
          icon: "error",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }
      if (currentUser.id === (buyerId || sellerId)) {
        Swal.fire({
          title: "Error",
          text: "You cannot chat with yourself!",
          icon: "error",
          timer: 2000,
          showConfirmButton: false
        });
        return;
      }

      $("#buyerSelectContainer").remove();
      $("#chatModal").modal("show");
      $("#chatModal").on("shown.bs.modal", function () {
        $("#chatInput").focus();
      });

      if (currentUser.role === "seller" && buyerId) {
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const buyer = users.find((u) => u.id === buyerId);
        if (buyer) {
          const buyerSelectHtml = `
            <div id="buyerSelectContainer" class="mb-3">
              <label for="buyerSelect" class="form-label">Chatting with:</label>
              <select id="buyerSelect" class="form-select" disabled>
                <option value="${buyerId}" selected>${buyer.name} (${buyer.email})</option>
              </select>
            </div>
          `;
          $("#chatModal .modal-body").prepend(buyerSelectHtml);
        }
        loadChatMessages(currentUser.id, buyerId, productId);
      } else if (currentUser.role === "buyer" && sellerId) {
        loadChatMessages(sellerId, currentUser.id, productId);
      }

      $("#sendChatBtn").off("click").on("click", function () {
        const message = $("#chatInput").val().trim();
        if (!message) {
          Swal.fire({
            title: "Error",
            text: "Please enter a message.",
            icon: "error",
            timer: 2000,
            showConfirmButton: false
          });
          return;
        }

        const chatBuyerId = currentUser.role === "seller" ? $("#buyerSelect").val() : currentUser.id;
        const chatSellerId = currentUser.role === "seller" ? currentUser.id : sellerId;
        const chatKey = `chat_${chatBuyerId}_${chatSellerId}_${productId}`;
        let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");

        chatHistory.push({
          senderId: currentUser.id,
          senderName: currentUser.name,
          message,
          timestamp: new Date().toISOString(),
        });

        localStorage.setItem(chatKey, JSON.stringify(chatHistory));
        $("#chatInput").val("");
        loadChatMessages(chatSellerId, chatBuyerId, productId);
      });
    });
  }

  function loadChatMessages(sellerId, buyerId, productId) {
    if (!sellerId || !buyerId || !productId) {
      $("#chatMessages")
        .empty()
        .html("<p class='text-muted text-center'>Error: Unable to load chat. Please try again.</p>");
      return;
    }

    const chatKey = `chat_${buyerId}_${sellerId}_${productId}`;
    let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");
    const chatContainer = $("#chatMessages").empty();
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));

    if (chatHistory.length === 0) {
      const emptyMessage =
        currentUser.id === sellerId ? "No messages yet with this buyer." : "No messages yet with this seller.";
      chatContainer.html(`<p class='text-muted text-center'>${emptyMessage}</p>`);
      return;
    }

    chatHistory.forEach((msg) => {
      const isCurrentUser = msg.senderId === currentUser.id;
      const alignment = isCurrentUser ? "text-end" : "text-start";
      const badgeColor = isCurrentUser ? "success" : "primary";
      chatContainer.append(`
        <div class="${alignment}">
          <span class="badge bg-${badgeColor} mb-1">
            ${msg.senderName}: ${msg.message}
            <small class="text-muted ms-2">${new Date(msg.timestamp).toLocaleString()}</small>
          </span>
        </div>
      `);
    });

    chatContainer.scrollTop(chatContainer[0].scrollHeight);
  }

  // FAQ LOGIC
  if ($("#faqList").length > 0) {
    $.getJSON("Data/faqs.json", function (faqs) {
      const faqList = $("#faqList");

      function renderFaqs(filteredFaqs) {
        faqList.empty();
        if (filteredFaqs.length === 0) {
          faqList.html("<p class='text-center text-muted'>No FAQs found matching your search.</p>");
          return;
        }
        filteredFaqs.forEach((faq, index) => {
          faqList.append(`
            <div class="accordion-item">
                <h2 class="accordion-header" id="heading${index}">
                    <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#collapse${index}">
                        ${faq.question}
                    </button>
                </h2>
                <div id="collapse${index}" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                    <div class="accordion-body">
                        ${faq.answer}
                    </div>
                </div>
            </div>
          `);
        });
      }

      renderFaqs(faqs.slice(0, 5));

      $("#faqSearch").on("input", function () {
        const query = $(this).val().trim().toLowerCase();
        if (!query) {
          renderFaqs(faqs.slice(0, 5));
          return;
        }

        const filteredFaqs = faqs.filter(
          (faq) =>
            faq.question.toLowerCase().includes(query) ||
            faq.answer.toLowerCase().includes(query)
        );
        renderFaqs(filteredFaqs);
      });
    });
  }

  // Real-time validation for postProductForm
$("#postProductForm input, #postProductForm select, #postProductForm textarea").on("input change", function () {
  const $input = $(this);
  const $error = $input.next(".invalid-feedback");
  const id = $input.attr("id");
  let isValid = true;

  if (id === "productTitle" || id === "productCity" || id === "productState") {
    isValid = $input.val().trim() !== "";
    $error.text(isValid ? "" : `${$input.prev("label").text()} is required.`);
  } else if (id === "productDescription") {
    isValid = $input.val().trim() !== "";
    $error.text(isValid ? "" : "Product description is required.");
  } else if (id === "productPrice") {
    const price = parseFloat($input.val());
    isValid = !isNaN(price) && price > 0;
    $error.text(isValid ? "" : "Price must be a positive number.");
  } else if (id === "productCategory") {
    isValid = $input.val() !== "";
    $error.text(isValid ? "" : "Please select a category.");
  } else if (id === "productImage") {
    isValid = $input[0].files.length > 0;
    $error.text(isValid ? "" : "Please select an image.");
  }

  $input.toggleClass("is-invalid", !isValid);
  $error.toggleClass("d-block", !isValid).toggleClass("d-none", isValid);
});

// Real-time validation for editProductForm
$("#editProductForm input, #editProductForm textarea").on("input change", function () {
  const $input = $(this);
  const $error = $input.next(".invalid-feedback");
  const id = $input.attr("id");
  let isValid = true;

  if (id === "editProductTitle" || id === "editProductCity" || id === "editProductState" || id === "editProductCategory") {
    isValid = $input.val().trim() !== "";
    $error.text(isValid ? "" : `${$input.prev("label").text()} is required.`);
  } else if (id === "editProductDescription") {
    isValid = $input.val().trim() !== "";
    $error.text(isValid ? "" : "Product description is required.");
  } else if (id === "editProductPrice") {
    const price = parseFloat($input.val());
    isValid = !isNaN(price) && price > 0;
    $error.text(isValid ? "" : "Price must be a positive number.");
  }

  $input.toggleClass("is-invalid", !isValid);
  $error.toggleClass("d-block", !isValid).toggleClass("d-none", isValid);
});

// Real-time validation for loginForm
$("#loginForm input").on("input change", function () {
  const $input = $(this);
  const $error = $input.next(".invalid-feedback");
  const id = $input.attr("id");
  let isValid = true;

  if (id === "loginEmail") {
    isValid = isValidEmail($input.val().trim());
    $error.text(isValid ? "" : "Invalid email");
  } else if (id === "loginPassword") {
    isValid = $input.val().trim().length >= 6;
    $error.text(isValid ? "" : "Password must be at least 6 characters");
  }

  $input.toggleClass("is-invalid", !isValid);
  $error.toggleClass("d-block", !isValid).toggleClass("d-none", isValid);
});

// Real-time validation for signupForm
$("#signupForm input, #signupForm select").on("input change", function () {
  const $input = $(this);
  const $error = $input.next(".invalid-feedback");
  const id = $input.attr("id");
  let isValid = true;

  if (id === "signupName") {
    isValid = $input.val().trim() !== "";
    $error.text(isValid ? "" : "Name is required");
  } else if (id === "signupEmail") {
    const email = $input.val().trim();
    const users = JSON.parse(localStorage.getItem("users") || "[]");
    isValid = isValidEmail(email) && !users.some((u) => u.email === email);
    $error.text(isValid ? "" : isValidEmail(email) ? "Email already exists" : "Invalid email");
  } else if (id === "signupPassword") {
    isValid = $input.val().trim().length >= 6;
    $error.text(isValid ? "" : "Password must be at least 6 characters");
  } else if (id === "userRole") {
    isValid = $input.val() !== "";
    $error.text(isValid ? "" : "Please select a role");
  }

  $input.toggleClass("is-invalid", !isValid);
  $error.toggleClass("d-block", !isValid).toggleClass("d-none", isValid);
});

});