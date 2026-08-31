/* ============================================================
   EVENT CONFIG — edit everything here
   ============================================================ */
const EVENT = {
    date: "02 September 2026",
    time: "09:30 AM Onwards",
    targetISO: "2026-09-02T09:30:00+05:30",
    city: "Nagercoil",
    venue: "Sree Krishna Inn",
    address: "Nagercoil, Tamil Nadu",
    phone: "[ Contact number ]",
    register: "",
    maps: "https://maps.google.com/?q=Sree+Krishna+Inn+Nagercoil",
    s1name: "[ Speaker 1 Name ]",
    s1topic: "[ Session topic ]",
    s2name: "[ Speaker 2 Name ]",
    s2topic: "[ Session topic ]",
    t1: "[ 09:30 AM ]",
    t2: "[ 11:30 AM ]",
    t3: "[ 01:00 PM ]",
    t4: "[ 03:30 PM ]"
};

document.querySelectorAll("[data-bind]").forEach(el => {
    const v = EVENT[el.dataset.bind];
    if (v) el.textContent = v;
    if (el.dataset.href === "tel" && v && !v.startsWith("[")) el.href = "tel:" + v.replace(/\s/g, "");
});
document.querySelectorAll("[data-register]").forEach(a => {
    if (EVENT.register) { a.href = EVENT.register; a.target = "_blank"; a.rel = "noopener"; }
});
document.querySelectorAll("[data-maps]").forEach(a => {
    if (EVENT.maps) { a.href = EVENT.maps; a.target = "_blank"; a.rel = "noopener"; }
});

const REDUCED = matchMedia("(prefers-reduced-motion: reduce)").matches;

/* NAV -------------------------------------------------------- */
const nav = document.getElementById("nav");
const burger = document.getElementById("burger");
const drawer = document.getElementById("drawer");

addEventListener("scroll", () => nav.classList.toggle("solid", scrollY > 40), { passive: true });

burger.addEventListener("click", () => {
    const open = drawer.classList.toggle("open");
    burger.classList.toggle("x", open);
    burger.setAttribute("aria-expanded", open);
});
drawer.querySelectorAll("a").forEach(a => a.addEventListener("click", () => {
    drawer.classList.remove("open"); burger.classList.remove("x");
    burger.setAttribute("aria-expanded", "false");
}));

const links = [...document.querySelectorAll(".nav-links a")];
const spy = new IntersectionObserver(es => {
    es.forEach(e => {
        if (e.isIntersecting) links.forEach(l => l.classList.toggle("on", l.getAttribute("href") === "#" + e.target.id));
    });
}, { rootMargin: "-45% 0px -50% 0px" });
["event", "experience", "details"].forEach(id => {
    const s = document.getElementById(id); if (s) spy.observe(s);
});

/* REVEAL ------------------------------------------------------ */
const rv = new IntersectionObserver((es, o) => {
    es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); o.unobserve(e.target); } });
}, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
document.querySelectorAll(".rv").forEach(el => rv.observe(el));

/* GATE — a sealed envelope. Tap it, watch it open, then let the
   invitation "unfold" into the hero ----------------------------- */
(function () {
    const gate = document.getElementById("gate");
    const envelope = document.getElementById("envelope");
    if (!gate) { return; }
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    let opening = false;

    function openGate() {
        if (opening) return;
        opening = true;
        gate.classList.add("opening");
        if (envelope) envelope.classList.add("open");
        gate.removeEventListener("click", openGate);
        gate.removeEventListener("keydown", onKey);

        const delay = REDUCED ? 0 : 900;
        setTimeout(() => {
            gate.classList.add("opened");
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
            document.getElementById("invite").classList.add("ready");
            document.getElementById("seal").classList.add("ready");
        }, delay);
    }
    function onKey(e) {
        if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openGate(); }
    }
    gate.addEventListener("click", openGate);
    gate.addEventListener("keydown", onKey);
})();

/* HERO — 3D wireframe globe ------------------------------------- */
(function () {
    const cv = document.getElementById("field");
    if (!cv) return;
    const ctx = cv.getContext("2d");
    let W = 0, H = 0, dpr = 1, raf = null, visible = true;
    let rotY = 0, rotX = 0, tgX = 0, tgY = 0;

    const LAT = 6, LAT_SEGS = 44, LONG = 9, LONG_SEGS = 30;
    const DN = 0.652, DX = 1.154; // min/max depth factor produced by project()

    function buildGlobe() {
        const lats = [], longs = [], nodes = [];
        for (let i = 1; i < LAT; i++) {
            const phi = Math.PI * i / LAT, ring = [];
            for (let j = 0; j <= LAT_SEGS; j++) {
                const th = 2 * Math.PI * j / LAT_SEGS;
                ring.push({ x: Math.sin(phi) * Math.cos(th), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(th) });
            }
            lats.push(ring);
            if (i % 2 === 0) {
                for (let j = 0; j < LAT_SEGS; j += 5) nodes.push(ring[j]);
            }
        }
        for (let i = 0; i < LONG; i++) {
            const th = 2 * Math.PI * i / LONG, ring = [];
            for (let j = 0; j <= LONG_SEGS; j++) {
                const phi = Math.PI * j / LONG_SEGS;
                ring.push({ x: Math.sin(phi) * Math.cos(th), y: Math.cos(phi), z: Math.sin(phi) * Math.sin(th) });
            }
            longs.push(ring);
        }
        return { lats, longs, nodes };
    }
    const globe = buildGlobe();

    function size() {
        dpr = Math.min(devicePixelRatio || 1, 2);
        W = cv.clientWidth; H = cv.clientHeight;
        cv.width = W * dpr; cv.height = H * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    function project(n, cy, sy, cx, sx, scale) {
        let x = n.x * cy - n.z * sy, z = n.x * sy + n.z * cy;
        let y = n.y * cx - z * sx; z = n.y * sx + z * cx;
        const f = 3.0 / (3.6 + z);
        return { X: W / 2 + x * scale * f, Y: H * 0.42 + y * scale * f, D: f, Z: z };
    }
    function depthAlpha(d) {
        const n = Math.max(0, Math.min(1, (d - DN) / (DX - DN)));
        return Math.pow(n, 2.6);
    }
    function drawRing(ring, cy, sy, cx, sx, scale) {
        let prev = null;
        for (const pt of ring) {
            const p = project(pt, cy, sy, cx, sx, scale);
            if (prev) {
                const depth = (prev.D + p.D) / 2, a = depthAlpha(depth) * 0.5;
                if (a > 0.008) {
                    ctx.strokeStyle = `rgba(200,16,46,${a.toFixed(3)})`;
                    ctx.lineWidth = 0.9 * depth;
                    ctx.beginPath(); ctx.moveTo(prev.X, prev.Y); ctx.lineTo(p.X, p.Y); ctx.stroke();
                }
            }
            prev = p;
        }
    }
    function frame(ts) {
        raf = requestAnimationFrame(frame);
        if (!visible) return;
        rotY += (tgY - rotY) * 0.05 + 0.0014;
        rotX += (tgX - rotX) * 0.05;
        const cy = Math.cos(rotY), sy = Math.sin(rotY), cx = Math.cos(rotX), sx = Math.sin(rotX);
        const scale = Math.min(W, H) * 0.42;
        ctx.clearRect(0, 0, W, H);
        globe.lats.forEach(r => drawRing(r, cy, sy, cx, sx, scale));
        globe.longs.forEach(r => drawRing(r, cy, sy, cx, sx, scale));
        for (const n of globe.nodes) {
            const p = project(n, cy, sy, cx, sx, scale), a = depthAlpha(p.D);
            if (a > 0.02) {
                const r = 1.6 + a * 1.8;
                ctx.beginPath(); ctx.arc(p.X, p.Y, r, 0, 7);
                ctx.fillStyle = `rgba(200,16,46,${(a * 0.95).toFixed(3)})`; ctx.fill();
                ctx.beginPath(); ctx.arc(p.X, p.Y, r * 2.4, 0, 7);
                ctx.fillStyle = `rgba(200,16,46,${(a * 0.1).toFixed(3)})`; ctx.fill();
            }
        }
    }
    size();
    addEventListener("resize", size, { passive: true });
    new IntersectionObserver(es => { visible = es[0].isIntersecting; }).observe(cv);
    if (REDUCED) { rotY = 0.6; rotX = -0.18; frame(0); }
    else {
        cv.parentElement.addEventListener("pointermove", e => {
            const r = cv.getBoundingClientRect();
            tgY = ((e.clientX - r.left) / r.width - .5) * 1.1;
            tgX = ((e.clientY - r.top) / r.height - .5) * -0.5;
        });
        cv.parentElement.addEventListener("pointerleave", () => { tgX = 0; });
        raf = requestAnimationFrame(frame);
    }
})();

/* DAY ARC — draws itself in, markers & columns light up in step
   with the "day" as it scrolls into view ------------------------ */
(function () {
    const wrap = document.getElementById("dayArc");
    const grid = document.getElementById("dayGrid");
    if (!wrap || !grid) return;
    const fill = document.getElementById("arcFill");
    const markers = [...wrap.querySelectorAll(".arc-marker")];
    const cols = [...grid.querySelectorAll(".day-col")];
    const thresholds = [0.02, 0.35, 0.62, 0.95]; // matches marker t-positions on the curve

    const len = fill.getTotalLength();
    fill.style.strokeDasharray = len;
    fill.style.strokeDashoffset = REDUCED ? 0 : len;

    function tick() {
        const r = wrap.getBoundingClientRect();
        const mid = innerHeight * 0.68;
        const p = Math.max(0, Math.min(1, (mid - r.top) / Math.max(r.height, 1)));
        fill.style.strokeDashoffset = REDUCED ? 0 : len * (1 - p);
        markers.forEach((m, i) => m.classList.toggle("lit", p >= thresholds[i]));
        cols.forEach((c, i) => c.classList.toggle("active", p >= thresholds[i]));
    }
    addEventListener("scroll", tick, { passive: true });
    addEventListener("resize", tick, { passive: true });
    tick();
})();

/* COUNTDOWN — live days/hours/mins/secs to the event ----------- */
(function () {
    const dEl = document.getElementById("cdDays"), hEl = document.getElementById("cdHours"),
        mEl = document.getElementById("cdMins"), sEl = document.getElementById("cdSecs");
    if (!dEl) return;
    const target = new Date(EVENT.targetISO).getTime();
    const pad = n => String(n).padStart(2, "0");
    let timer = null;

    function tick() {
        const diff = target - Date.now();
        if (diff <= 0) {
            dEl.textContent = hEl.textContent = mEl.textContent = sEl.textContent = "00";
            clearInterval(timer);
            return;
        }
        const d = Math.floor(diff / 86400000);
        const h = Math.floor((diff % 86400000) / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        dEl.textContent = pad(d); hEl.textContent = pad(h); mEl.textContent = pad(m); sEl.textContent = pad(s);
    }
    tick();
    timer = setInterval(tick, 1000);
})();