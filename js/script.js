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

    $("#authModal").on("shown.bs.modal", function () {
      $("#loginForm")[0].reset();
      $("#signupForm")[0].reset();
      $(".text-danger").addClass("d-none");
      showForm("login");
      $("#loginEmail").focus();
    });

    function showForm(formType) {
      $(".auth-form").addClass("d-none");
      $(".btn-outline-primary").removeClass("active");
      if (formType === "login") {
        $("#login-form").removeClass("d-none");
        $(".btn-outline-primary:contains('Login')").addClass("active");
      } else {
        $("#signup-form").removeClass("d-none");
        $(".btn-outline-primary:contains('Signup')").addClass("active");
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

    $(document).on("click", ".btn-outline-primary", function () {
      const type = $(this).text().trim().toLowerCase();
      showForm(type);
    });

    $(document).on("click", ".nav-login a[data-form]", function () {
      const formType = $(this).data("form");
      showForm(formType);
    });

    $(document).on("submit", "#loginForm", function (e) {
      e.preventDefault();
      let email = $("#loginEmail").val().trim();
      let password = $("#loginPassword").val().trim();
      let valid = true;
      $(".text-danger").addClass("d-none");

      if (!isValidEmail(email)) {
        $("#loginEmailError").removeClass("d-none");
        valid = false;
      }
      if (password.length < 6) {
        $("#loginPasswordError").removeClass("d-none");
        valid = false;
      }

      if (valid) {
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        let user = users.find((u) => u.email === email && u.password === password);
        if (user) {
          localStorage.setItem("currentUser", JSON.stringify(user));
          $("#authModal").modal("hide");
          alert("Login successful!");
          checkLoginStatus();
        } else {
          $("#loginEmailError").text("Invalid email or password").removeClass("d-none");
        }
      }
    });

    $(document).on("submit", "#signupForm", function (e) {
      e.preventDefault();
      let name = $("#signupName").val().trim();
      let email = $("#signupEmail").val().trim();
      let password = $("#signupPassword").val().trim();
      let role = $("#userRole").val();
      let valid = true;

      $(".text-danger").addClass("d-none");

      if (!name) {
        $("#signupNameError").removeClass("d-none");
        valid = false;
      }
      if (!isValidEmail(email)) {
        $("#signupEmailError").text("Invalid email").removeClass("d-none");
        valid = false;
      } else {
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        if (users.some((u) => u.email === email)) {
          $("#signupEmailError").text("Email already exists").removeClass("d-none");
          valid = false;
        }
      }
      if (password.length < 6) {
        $("#signupPasswordError").removeClass("d-none");
        valid = false;
      }
      if (!role) {
        $("#userRoleError").removeClass("d-none");
        valid = false;
      }

      if (valid) {
        let users = JSON.parse(localStorage.getItem("users") || "[]");
        let newUser = { id: Date.now(), name, email, password, role };
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));
        $("#authModal").modal("hide");
        alert("Signup successful!");
        checkLoginStatus();
      }
    });

    $(document).on("click", "#logoutLink", function (e) {
      e.preventDefault();
      localStorage.removeItem("currentUser");
      checkLoginStatus();
      alert("Logged out successfully!");
      window.location.href = "index.html";
    });

    checkLoginStatus();
  });

  // POST PRODUCT PAGE LOGIC
  if ($("#postProductForm").length > 0) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    if (!currentUser || currentUser.role !== "seller") {
      alert("Only sellers can post products. Redirecting to Home.");
      window.location.href = "index.html";
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

    $("#postProductForm").submit(function (e) {
      e.preventDefault();

      const title = $("#productTitle").val().trim();
      const description = $("#productDescription").val().trim();
      const price = parseFloat($("#productPrice").val());
      const category = $("#productCategory").val();
      const city = $("#productCity").val().trim();
      const state = $("#productState").val().trim();
      const imageFile = $("#productImage")[0].files[0];

      if (!title || !description || !price || !category || !city || !state || !imageFile) {
        alert("Please fill all fields and select an image.");
        return;
      }

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

        alert("Product posted successfully!");
        $("#postProductForm")[0].reset();
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

    $("#editProductForm").submit(function (e) {
      e.preventDefault();
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
            alert("Product updated successfully!");
          };
          reader.readAsDataURL(newImageFile);
        } else {
          products[productIndex] = product;
          localStorage.setItem("products", JSON.stringify(products));
          $("#editProductModal").modal("hide");
          loadSellerProducts();
          alert("Product updated successfully!");
        }
      }
    });

    $(document).on("click", ".delete-product-btn", function () {
      const productId = $(this).data("id");
      if (confirm("Are you sure you want to delete this product?")) {
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
        alert("Product deleted successfully! All related requests have been rejected.");
      }
    });

    $(document).on("click", ".view-chat-btn", function () {
      const productId = $(this).data("id");
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      $("#buyerSelectContainer").remove();

      const allKeys = Object.keys(localStorage);
      const chatKeys = allKeys.filter((key) => key.startsWith(`chat_`) && key.endsWith(`_${productId}`));

      if (chatKeys.length === 0) {
        alert("No chats from buyers for this product yet.");
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
        alert("No valid buyer chats found for this product.");
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
          alert("Please select a buyer first.");
          return;
        }
        if (!message) {
          alert("Please enter a message.");
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

      let filteredProducts = products.filter((p) => {
        let match = true;
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
                      <button class="btn btn-primary mt-auto view-details-btn" data-id="${product.id}">View Details</button>
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
        alert("Please login to chat with the seller.");
        $("#authModal").modal("show");
        $("#authModal").on("shown.bs.modal", function () {
          $("#loginEmail").focus();
        });
        return;
      }
      if (currentUser.id === product.sellerId) {
        alert("You cannot chat with yourself!");
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
        alert("Please login to send a purchase request.");
        $("#authModal").modal("show");
        $("#authModal").on("shown.bs.modal", function () {
          $("#loginEmail").focus();
        });
        return;
      }
      if (currentUser.id === product.sellerId) {
        alert("You cannot request to buy your own product!");
        return;
      }
      if (currentUser.role !== "buyer") {
        alert("Only buyers can send purchase requests.");
        return;
      }

      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
      const existingRequest = requests.find(
        (r) => r.productId === productId && r.buyerId === currentUser.id && r.status === "Requested"
      );
      if (existingRequest) {
        alert("You already have a pending request for this product.");
        return;
      }

      const acceptedRequest = requests.find(
        (r) => r.productId === productId && r.status === "Accepted"
      );
      if (acceptedRequest) {
        alert("This product has already been sold.");
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
      alert("Purchase request sent successfully! Check My Orders for status.");
      window.location.href = "orders.html";
    });

    $(document).on("click", "#sendChatBtn", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const message = $("#chatInput").val().trim();
      if (!message) {
        alert("Please enter a message.");
        return;
      }

      const chatKey = `chat_${currentUser.id}_${product.sellerId}_${productId}`;
      let chatHistory = JSON.parse(localStorage.getItem(chatKey) || "[]");

      chatHistory.push({
        senderId: currentUser.id,
        senderName: currentUser.name,
        message,
        timestamp: new Date().toISOString(),
      });

      localStorage.setItem(chatKey, JSON.stringify(chatHistory));
      $("#chatInput").val("");
      loadChatMessages(product.sellerId, currentUser.id, productId);
    });

    let chatRefreshInterval;
    $("#chatModal").on("shown.bs.modal", function () {
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));
      const buyerId = $("#buyerSelect").val();
      const productIdFromChat = $(".view-chat-btn[data-id]").data("id") || productId;

      chatRefreshInterval = setInterval(() => {
        if (currentUser) {
          if (buyerId && productIdFromChat) {
            loadChatMessages(currentUser.id, parseInt(buyerId), productIdFromChat);
          } else if (productId) {
            loadChatMessages(product.sellerId, currentUser.id, productId);
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
      alert("Please login to view orders.");
      window.location.href = "index.html";
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
                                <i class="bi bi-chat-dots me-1"></i> Chat with Buyer
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
      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
      const request = requests.find((r) => r.id === requestId);
      if (!request || request.status !== "Requested") return;

      const productRequests = requests.filter((r) => r.productId === request.productId);
      productRequests.forEach((r) => {
        if (r.id === requestId) {
          r.status = "Accepted";
        } else if (r.status === "Requested") {
          r.status = "Rejected";
        }
      });

      localStorage.setItem("requests", JSON.stringify(requests));
      alert("Request accepted! Other requests for this product have been rejected.");
      renderSellerRequests();
    });

    $(document).on("click", ".reject-request-btn", function () {
      const requestId = parseInt($(this).data("request-id"));
      const requests = JSON.parse(localStorage.getItem("requests") || "[]");
      const requestIndex = requests.findIndex((r) => r.id === requestId);
      if (requestIndex !== -1 && requests[requestIndex].status === "Requested") {
        requests[requestIndex].status = "Rejected";
        localStorage.setItem("requests", JSON.stringify(requests));
        alert("Request rejected.");
        renderSellerRequests();
      }
    });

    $(document).on("click", ".chat-request-btn", function () {
      const productId = parseInt($(this).data("product-id"));
      const otherUserId = parseInt($(this).data("buyer-id") || $(this).data("seller-id"));
      const currentUser = JSON.parse(localStorage.getItem("currentUser"));

      $("#chatModal").modal("show");
      $("#chatModal").on("shown.bs.modal", function () {
        $("#chatInput").focus();
      });

      if (currentUser.role === "seller") {
        loadChatMessages(currentUser.id, otherUserId, productId);
        $("#buyerSelectContainer").remove();
        let buyerSelectHtml = `
          <div id="buyerSelectContainer" class="mb-3">
            <select id="buyerSelect" class="form-select">
              <option value="${otherUserId}" selected></option>
            </select>
          </div>
        `;
        $("#chatModal .modal-body").prepend(buyerSelectHtml);
        $("#sendChatBtn").off("click").on("click", function () {
          const buyerId = $("#buyerSelect").val();
          const message = $("#chatInput").val().trim();
          if (!buyerId) {
            alert("Please select a buyer first.");
            return;
          }
          if (!message) {
            alert("Please enter a message.");
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
      } else {
        loadChatMessages(otherUserId, currentUser.id, productId);
      }
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
      const badgeColor = isCurrentUser ? "primary" : "secondary";
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
        const query = $(this).val().toLowerCase();
        if (query === "") {
          renderFaqs(faqs.slice(0, 5));
        } else {
          const filteredFaqs = faqs.filter(
            (faq) =>
              faq.question.toLowerCase().includes(query) ||
              faq.answer.toLowerCase().includes(query)
          );
          renderFaqs(filteredFaqs);
        }
      });
    });
  }
});


