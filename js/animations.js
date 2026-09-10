// Animation Utilities
// Handles music notes, toasts, and interactive animations

const Animations = {
    // Create floating music notes on click
    createMusicNote(x, y) {
        const notesContainer = document.getElementById('musicNotesContainer');
        if (!notesContainer) return;

        const notes = ['♪', '♫', '♬'];
        const note = document.createElement('div');
        note.className = 'music-note';
        note.textContent = notes[Math.floor(Math.random() * notes.length)];

        const driftX = (Math.random() - 0.5) * 60;
        const rotate = (Math.random() - 0.5) * 30;

        note.style.left = x + 'px';
        note.style.top = y + 'px';
        note.style.setProperty('--drift-x', driftX + 'px');
        note.style.setProperty('--rotate', rotate + 'deg');

        notesContainer.appendChild(note);

        setTimeout(() => {
            note.remove();
        }, 2000);
    },

    // Create multiple music notes
    createMusicNoteBurst(x, y, count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const offsetX = x + (Math.random() - 0.5) * 20;
                const offsetY = y + (Math.random() - 0.5) * 20;
                this.createMusicNote(offsetX, offsetY);
            }, i * 100);
        }
    },

    // Show toast notification
    showToast(message, type = 'info', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        if (!toastContainer) return;

        const toast = document.createElement('div');
        toast.className = 'toast';

        const iconMap = {
            success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>`,
            error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>`,
            info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="16" x2="12" y2="12"></line>
                <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>`
        };

        toast.innerHTML = `
            <div class="toast-icon ${type}">
                ${iconMap[type] || iconMap.info}
            </div>
            <div class="toast-message">${message}</div>
        `;

        toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    },

    // Magnetic button effect
    addMagneticEffect(element, strength = 0.3) {
        if (!element) return;

        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = (e.clientX - centerX) * strength;
            const deltaY = (e.clientY - centerY) * strength;

            element.style.setProperty('--magnetic-x', deltaX + 'px');
            element.style.setProperty('--magnetic-y', deltaY + 'px');
            element.classList.add('attracted');
        });

        element.addEventListener('mouseleave', () => {
            element.style.setProperty('--magnetic-x', '0px');
            element.style.setProperty('--magnetic-y', '0px');
            element.classList.remove('attracted');
        });
    },

    // Crossfade artwork transition
    crossfadeArtwork(imgElement, newSrc) {
        if (!imgElement) return;

        const oldSrc = imgElement.src;
        if (oldSrc === newSrc) return;

        imgElement.style.opacity = '0';
        imgElement.style.filter = 'blur(10px)';

        setTimeout(() => {
            imgElement.src = newSrc;
            imgElement.onload = () => {
                imgElement.style.transition = 'all 0.6s cubic-bezier(0.22, 1, 0.36, 1)';
                imgElement.style.opacity = '1';
                imgElement.style.filter = 'blur(0)';
            };
        }, 200);
    },

    // Spring animation helper
    springTo(element, property, targetValue, config = {}) {
        const {
            tension = 170,
            friction = 26,
            mass = 1
        } = config;

        if (!element) return;

        const currentValue = parseFloat(getComputedStyle(element)[property]) || 0;
        let velocity = 0;
        let position = currentValue;
        const target = targetValue;

        const animate = () => {
            const springForce = -tension * (position - target);
            const dampingForce = -friction * velocity;
            const acceleration = (springForce + dampingForce) / mass;

            velocity += acceleration * 0.016;
            position += velocity * 0.016;

            element.style[property] = position + 'px';

            if (Math.abs(velocity) > 0.1 || Math.abs(position - target) > 0.1) {
                requestAnimationFrame(animate);
            } else {
                element.style[property] = target + 'px';
            }
        };

        animate();
    },

    // Ripple effect on click
    createRipple(element, event) {
        const ripple = document.createElement('span');
        const rect = element.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.3);
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            transform: scale(0);
            animation: rippleEffect 0.6s ease-out;
        `;

        element.style.position = 'relative';
        element.style.overflow = 'hidden';
        element.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    },

    // View transition
    transitionView(fromView, toView) {
        if (fromView) {
            fromView.classList.add('view-fade-exit');
            setTimeout(() => {
                fromView.classList.remove('active', 'view-fade-exit');
            }, 150);
        }

        if (toView) {
            toView.classList.add('view-fade-enter');
            setTimeout(() => {
                toView.classList.add('active');
                requestAnimationFrame(() => {
                    toView.classList.add('view-fade-enter-active');
                    toView.classList.remove('view-fade-enter');
                    setTimeout(() => {
                        toView.classList.remove('view-fade-enter-active');
                    }, 300);
                });
            }, 10);
        }
    }
};

// Add ripple animation CSS if not already present
if (!document.getElementById('ripple-animation-styles')) {
    const style = document.createElement('style');
    style.id = 'ripple-animation-styles';
    style.textContent = `
        @keyframes rippleEffect {
            to {
                transform: scale(2);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}
