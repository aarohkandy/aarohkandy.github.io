// Cubes Background Effect - Converted from React to Vanilla JS
(function() {
    const gridSize = 15;
    const cubeSize = null; // Use 1fr for responsive
    const maxAngle = 30;
    const radius = 4;
    const easing = 'power3.out';
    const duration = { enter: 0.3, leave: 0.6 };
    const cellGap = { col: '2%', row: '2%' };
    const borderStyle = '1px solid rgba(255, 255, 255, 0.2)';
    const faceColor = 'rgba(90, 74, 58, 0.15)';
    const autoAnimate = true;
    const rippleOnClick = true;
    const rippleColor = 'rgba(163, 92, 56, 0.4)';
    const rippleSpeed = 2;

    let sceneRef = null;
    let rafRef = null;
    let idleTimerRef = null;
    let userActiveRef = false;
    let simPosRef = { x: 0, y: 0 };
    let simTargetRef = { x: 0, y: 0 };
    let simRAFRef = null;

    const colGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.col || '2%';
    const rowGap = typeof cellGap === 'number' ? `${cellGap}px` : cellGap?.row || '2%';
    const enterDur = duration.enter;
    const leaveDur = duration.leave;

    function tiltAt(rowCenter, colCenter) {
        if (!sceneRef) return;
        sceneRef.querySelectorAll('.cube').forEach(cube => {
            const r = +cube.dataset.row;
            const c = +cube.dataset.col;
            const dist = Math.hypot(r - rowCenter, c - colCenter);
            if (dist <= radius) {
                const pct = 1 - dist / radius;
                const angle = pct * maxAngle;
                gsap.to(cube, {
                    duration: enterDur,
                    ease: easing,
                    overwrite: true,
                    rotateX: -angle,
                    rotateY: angle
                });
            } else {
                gsap.to(cube, {
                    duration: leaveDur,
                    ease: 'power3.out',
                    overwrite: true,
                    rotateX: 0,
                    rotateY: 0
                });
            }
        });
    }

    function onPointerMove(e) {
        userActiveRef = true;
        if (idleTimerRef) clearTimeout(idleTimerRef);

        const rect = sceneRef.getBoundingClientRect();
        const cellW = rect.width / gridSize;
        const cellH = rect.height / gridSize;
        const colCenter = (e.clientX - rect.left) / cellW;
        const rowCenter = (e.clientY - rect.top) / cellH;

        if (rafRef) cancelAnimationFrame(rafRef);
        rafRef = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

        idleTimerRef = setTimeout(() => {
            userActiveRef = false;
        }, 3000);
    }

    function resetAll() {
        if (!sceneRef) return;
        sceneRef.querySelectorAll('.cube').forEach(cube =>
            gsap.to(cube, {
                duration: leaveDur,
                rotateX: 0,
                rotateY: 0,
                ease: 'power3.out'
            })
        );
    }

    function onTouchMove(e) {
        e.preventDefault();
        userActiveRef = true;
        if (idleTimerRef) clearTimeout(idleTimerRef);

        const rect = sceneRef.getBoundingClientRect();
        const cellW = rect.width / gridSize;
        const cellH = rect.height / gridSize;

        const touch = e.touches[0];
        const colCenter = (touch.clientX - rect.left) / cellW;
        const rowCenter = (touch.clientY - rect.top) / cellH;

        if (rafRef) cancelAnimationFrame(rafRef);
        rafRef = requestAnimationFrame(() => tiltAt(rowCenter, colCenter));

        idleTimerRef = setTimeout(() => {
            userActiveRef = false;
        }, 3000);
    }

    function onTouchStart() {
        userActiveRef = true;
    }

    function onTouchEnd() {
        if (!sceneRef) return;
        resetAll();
    }

    function onClick(e) {
        if (!rippleOnClick || !sceneRef) return;
        const rect = sceneRef.getBoundingClientRect();
        const cellW = rect.width / gridSize;
        const cellH = rect.height / gridSize;

        const clientX = e.clientX || (e.touches && e.touches[0].clientX);
        const clientY = e.clientY || (e.touches && e.touches[0].clientY);

        const colHit = Math.floor((clientX - rect.left) / cellW);
        const rowHit = Math.floor((clientY - rect.top) / cellH);

        const baseRingDelay = 0.15;
        const baseAnimDur = 0.3;
        const baseHold = 0.6;

        const spreadDelay = baseRingDelay / rippleSpeed;
        const animDuration = baseAnimDur / rippleSpeed;
        const holdTime = baseHold / rippleSpeed;

        const rings = {};
        sceneRef.querySelectorAll('.cube').forEach(cube => {
            const r = +cube.dataset.row;
            const c = +cube.dataset.col;
            const dist = Math.hypot(r - rowHit, c - colHit);
            const ring = Math.round(dist);
            if (!rings[ring]) rings[ring] = [];
            rings[ring].push(cube);
        });

        Object.keys(rings)
            .map(Number)
            .sort((a, b) => a - b)
            .forEach(ring => {
                const delay = ring * spreadDelay;
                const faces = rings[ring].flatMap(cube => Array.from(cube.querySelectorAll('.cube-face')));

                gsap.to(faces, {
                    backgroundColor: rippleColor,
                    duration: animDuration,
                    delay,
                    ease: 'power3.out'
                });
                gsap.to(faces, {
                    backgroundColor: faceColor,
                    duration: animDuration,
                    delay: delay + animDuration + holdTime,
                    ease: 'power3.out'
                });
            });
    }

    function initCubes() {
        const container = document.getElementById('cubesBackground');
        if (!container) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'cubes-wrapper';
        wrapper.style.setProperty('--cube-face-border', borderStyle);
        wrapper.style.setProperty('--cube-face-bg', faceColor);

        const scene = document.createElement('div');
        scene.className = 'cubes-scene';
        scene.style.gridTemplateColumns = cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`;
        scene.style.gridTemplateRows = cubeSize ? `repeat(${gridSize}, ${cubeSize}px)` : `repeat(${gridSize}, 1fr)`;
        scene.style.columnGap = colGap;
        scene.style.rowGap = rowGap;

        sceneRef = scene;

        // Create cubes
        for (let r = 0; r < gridSize; r++) {
            for (let c = 0; c < gridSize; c++) {
                const cube = document.createElement('div');
                cube.className = 'cube';
                cube.dataset.row = r;
                cube.dataset.col = c;

                const faces = ['top', 'bottom', 'left', 'right', 'front', 'back'];
                faces.forEach(face => {
                    const faceEl = document.createElement('div');
                    faceEl.className = `cube-face cube-face--${face}`;
                    cube.appendChild(faceEl);
                });

                scene.appendChild(cube);
            }
        }

        wrapper.appendChild(scene);
        container.appendChild(wrapper);

        // Event listeners
        scene.addEventListener('pointermove', onPointerMove);
        scene.addEventListener('pointerleave', resetAll);
        scene.addEventListener('click', onClick);
        scene.addEventListener('touchmove', onTouchMove, { passive: false });
        scene.addEventListener('touchstart', onTouchStart, { passive: true });
        scene.addEventListener('touchend', onTouchEnd, { passive: true });

        // Auto animation
        if (autoAnimate) {
            simPosRef = {
                x: Math.random() * gridSize,
                y: Math.random() * gridSize
            };
            simTargetRef = {
                x: Math.random() * gridSize,
                y: Math.random() * gridSize
            };
            const speed = 0.02;
            const loop = () => {
                if (!userActiveRef) {
                    const pos = simPosRef;
                    const tgt = simTargetRef;
                    pos.x += (tgt.x - pos.x) * speed;
                    pos.y += (tgt.y - pos.y) * speed;
                    tiltAt(pos.y, pos.x);
                    if (Math.hypot(pos.x - tgt.x, pos.y - tgt.y) < 0.1) {
                        simTargetRef = {
                            x: Math.random() * gridSize,
                            y: Math.random() * gridSize
                        };
                    }
                }
                simRAFRef = requestAnimationFrame(loop);
            };
            simRAFRef = requestAnimationFrame(loop);
        }
    }

    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initCubes);
    } else {
        initCubes();
    }
})();

