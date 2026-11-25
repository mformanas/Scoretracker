// Supplies the SVG filter that gives the chess board and cards their soft, painted edges.
(function () {
  function build() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'paint'); svg.setAttribute('aria-hidden', 'true');
    svg.innerHTML = '<defs><filter id="wc-edge" x="-5%" y="-5%" width="110%" height="110%"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter></defs>';
    document.body.prepend(svg);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
