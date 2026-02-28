/**
 * Embedded Extension Scripts
 */

export const M7_EXTENSION_SCRIPTS = {
  content: `
    "use strict";
    const selectors = ".am-body-content-wrapper;#info;.white-bg-wrapper-fullw;.tawk-chat-panel tawk-custom-flex-1 ps--active-y;#member-main-subscriptions;.gplelite;.tawk-min-chat-icon;#simple-chat-button--container;footer;#card-support-buttons;.ToolsMinati;.overflow-x-hidden;.tawk-icon-right;.font-lato;#simple-chat-button--container;.tawk-custom-color.tawk-custom-border-color.tawk-button.tawk-button-circle.tawk-button-large;.am-signup;.grid-container;#profile;.profile_block;.am-active-invoice;#tawk-chatinput-container;#popup;.am-footer;.tawk-custom-color tawk-custom-border-color tawk-button tawk-button-circle tawk-button-large;.tawk-mobile;.widget-visible".split(";");
    
    selectors.forEach(t => {
      document.querySelectorAll(t).forEach(el => {
        el.style.display = "none";
      });
    });

    if ("https://app.toolsminati.com/" === window.location.href) {
      const a = document.querySelector(".am-body-content");
      if (a) a.style.display = "none";
      setTimeout(() => { window.location.href = "/login" }, 100);
    }

    if (["https://app.toolsminati.com/login", "https://app.toolsminati.com/member"].includes(window.location.href)) {
      document.querySelectorAll(".amember-login").forEach(t => {
        t.style.webkitTextSecurity = "square";
      });
    }

    const style = document.createElement("style");
    style.textContent = \`
      .am-login-form-wrapper { display: none !important; }
      .am-resource-page { background-color: #0EC9AC !important; }
      body.font-lato, html.font-lato {
        font: 400 16px Lato,sans-serif!important;
        display: none !important;
      }
      .am-body .am-body-content-wrapper {
        text-align: left;
        background-color: #f1f5f900 !important;
        padding-bottom: 23px;
        position: relative;
        min-height: 93vh;
      }
      .sv { color: red !important; }
    \`;
    document.head.appendChild(style);

    if ("https://app.toolsminati.com/login" === window.location.href) {
      const n = document.getElementById("amember-login");
      const o = document.getElementById("amember-pass");
      const e = document.querySelector(".buttonorange");
      if (n && o && e) {
        n.value = "indigo";
        o.value = 'K+l7"_UK{"-luMB&';
        e.click();
        setTimeout(() => {
          if (document.querySelector(".errors.am-login-errors")) {
            setTimeout(() => { window.location.href = "https://direct.help/@contactm7" }, 60);
          }
        }, 500);
      }
    }

    if ("https://direct.help/@contactm7" === window.location.href) {
      alert("Você terá assistência em tempo real. Por favor, Não feche esta janela.");
    }

    if (["https://app.toolsminati.com/member", "https://toolsminati.com/"].includes(window.location.href)) {
      window.location.replace("https://wagner.marcellus7.com/dashboard/");
    }
  `,
  accessDeniedCheck: `
    window.addEventListener("load", function() {
      setTimeout(function() {
        const h1s = document.getElementsByTagName("h1");
        for (let i = 0; i < h1s.length; i++) {
          if (h1s[i].innerText.includes("Access Denied")) {
            alert("Erro de atualização na extensão. Por favor, entre em contato rapidamente.");
            window.location.href = "https://direct.help/@contactm7";
          }
        }
      }, 3000);
    });
  `,
  replitFix: `
    if (location.href.includes("membrosdevbox.replit.app/membros.html")) {
      new MutationObserver((mutations, observer) => {
        const store = document.getElementById("tabStore");
        const notify = document.getElementById("notificationBtn");
        if (store) store.style.display = "none";
        if (notify) notify.style.display = "none";
        if (store && notify) observer.disconnect();
      }).observe(document.documentElement, { childList: true, subtree: true });
    }
    if (location.href.includes("membrosdevbox.replit.app/acesso.html")) {
      function clickAccess() {
        const btn = document.getElementById("accessBtn");
        if (btn) btn.click();
        else setTimeout(clickAccess, 100);
      }
      if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", clickAccess);
      else clickAccess();
    }
  `
};
