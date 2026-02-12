// fvtt-login-patcher: setup toggle init (runs in foundry.mjs; innerHTML-inserted scripts do not run)
(function(){
  function initJoinSetupToggle() {
    var setup = document.getElementById("join-game-setup");
    var toggle = document.getElementById("join-setup-toggle");
    if (!setup || !toggle || toggle.dataset.bound === "1") return;
    toggle.dataset.bound = "1";
    setup.style.display = "none";
    function syncText() { toggle.textContent = setup.style.display === "none" ? ">" : "<"; }
    function doToggle(e) { if (e) e.preventDefault(); setup.style.display = setup.style.display === "none" ? "" : "none"; syncText(); }
    toggle.addEventListener("click", doToggle, true);
    toggle.addEventListener("keydown", function(ev) { if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); doToggle(); } }, true);
    syncText();
  }
  function run() {
    if (document.getElementById("join-setup-toggle")) {
      initJoinSetupToggle();
      return;
    }
    var obs = new MutationObserver(function() {
      if (document.getElementById("join-setup-toggle")) {
        obs.disconnect();
        initJoinSetupToggle();
      }
    });
    obs.observe(document.body, { childList: true, subtree: true });
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run);
  } else {
    run();
  }
})();
// fvtt-login-patcher: setup toggle init end
