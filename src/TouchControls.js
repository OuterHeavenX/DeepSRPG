// Returns a normalized vector {x, y} in range [-1, 1] each.
export class VirtualJoystick {
  constructor(joystickEl, knobEl) {
    this.el = joystickEl;
    this.knob = knobEl;
    this.vector = { x: 0, y: 0 };
    this.activeId = null;
    this.radius = 0;
    this.center = { x: 0, y: 0 };

    this.el.addEventListener('touchstart', e => this._start(e), { passive: false });
    this.el.addEventListener('touchmove',  e => this._move(e),  { passive: false });
    this.el.addEventListener('touchend',   e => this._end(e),   { passive: false });
    this.el.addEventListener('touchcancel',e => this._end(e),   { passive: false });

    // Mouse fallback for desktop testing
    this.el.addEventListener('mousedown', e => this._mouseStart(e));
    window.addEventListener('mousemove', e => this._mouseMove(e));
    window.addEventListener('mouseup', () => this._mouseEnd());
    this._mouseActive = false;

    this._recalc();
    window.addEventListener('resize', () => this._recalc());
  }

  _recalc() {
    const r = this.el.getBoundingClientRect();
    this.radius = r.width / 2;
    this.center = { x: r.left + this.radius, y: r.top + this.radius };
  }

  _start(e) {
    if (this.activeId !== null) return;
    const t = e.changedTouches[0];
    this.activeId = t.identifier;
    this._recalc();
    this._updateFromPoint(t.clientX, t.clientY);
    e.preventDefault();
  }

  _move(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === this.activeId) {
        this._updateFromPoint(t.clientX, t.clientY);
        e.preventDefault();
      }
    }
  }

  _end(e) {
    for (const t of e.changedTouches) {
      if (t.identifier === this.activeId) {
        this.activeId = null;
        this.vector.x = 0;
        this.vector.y = 0;
        this.knob.style.transform = 'translate(0px, 0px)';
        e.preventDefault();
      }
    }
  }

  _mouseStart(e) {
    this._mouseActive = true;
    this._recalc();
    this._updateFromPoint(e.clientX, e.clientY);
  }
  _mouseMove(e) {
    if (!this._mouseActive) return;
    this._updateFromPoint(e.clientX, e.clientY);
  }
  _mouseEnd() {
    if (!this._mouseActive) return;
    this._mouseActive = false;
    this.vector.x = 0; this.vector.y = 0;
    this.knob.style.transform = 'translate(0px, 0px)';
  }

  _updateFromPoint(px, py) {
    let dx = px - this.center.x;
    let dy = py - this.center.y;
    const dist = Math.hypot(dx, dy);
    const max = this.radius;
    if (dist > max) {
      dx = (dx / dist) * max;
      dy = (dy / dist) * max;
    }
    this.knob.style.transform = `translate(${dx}px, ${dy}px)`;
    this.vector.x = dx / max;
    this.vector.y = dy / max;
  }
}

export class ActionButton {
  constructor(el) {
    this.el = el;
    this.pressed = false;
    this.onPress = null;

    const down = e => { this.pressed = true; if (this.onPress) this.onPress(); e.preventDefault(); };
    const up = e => { this.pressed = false; e.preventDefault(); };

    el.addEventListener('touchstart', down, { passive: false });
    el.addEventListener('touchend', up, { passive: false });
    el.addEventListener('mousedown', down);
    el.addEventListener('mouseup', up);
  }
}
