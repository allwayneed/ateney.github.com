(function () {
      /* 不協和音: 半音クラッシュ (440Hz / 466.16Hz) + その下のオクターブ。
         警報っぽさを出すため sawtooth で。 */
      var ctx = null;
      try {
        var AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ctx = new AC();
      } catch (e) {}

      // 自動再生ブロック対策: 何かしら操作されていれば音が出る
      ["pointerdown", "keydown", "touchstart"].forEach(function (ev) {
        document.addEventListener(ev, function () {
          if (ctx && ctx.state === "suspended") ctx.resume();
        }, { once: false });
      });

      function discordBeep() {
        if (!ctx || ctx.state !== "running") return;
        var t = ctx.currentTime;
        [440, 466.16, 233.08].forEach(function (f) {
          var o = ctx.createOscillator();
          var g = ctx.createGain();
          o.type = "sawtooth";
          o.frequency.value = f;
          g.gain.setValueAtTime(0.12, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
          o.connect(g);
          g.connect(ctx.destination);
          o.start(t);
          o.stop(t + 1.1);
        });
      }

      // 5秒後: 不協和音 → 強制的に / へ (replace なので戻るボタンでも戻れない)
      setTimeout(function () {
        discordBeep();
        setTimeout(function () {
          window.location.replace("/");
        }, 1000);
      }, 5000);
    })();
