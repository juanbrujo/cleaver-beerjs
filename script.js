/**
 * Returns the current page number of the presentation.
 */
function currentPosition() {
  return parseInt(document.querySelector('.slide:not(.hidden)').id.slice(6));
}

/**
 * Navigates forward n pages
 * If n is negative, we will navigate in reverse
 */
function navigate(n) {
  var position = currentPosition();
  var numSlides = document.getElementsByClassName('slide').length;

  var $fragments = document.querySelectorAll('#slide-' + position + ' .fragment');
  var fragmentsFinished = false;
  if ($fragments.length) {
    if (n > 0) {
      var $f = document.querySelectorAll('#slide-' + position + ' .fragment.hidden');
      if (!$f.length) fragmentsFinished = true;
      else $f[0].classList.remove('hidden');
    } else {
      var $f = document.querySelectorAll('#slide-' + position + ' .fragment:not(.hidden)');
      if (!$f.length) fragmentsFinished = true;
      else $f[$f.length - 1].classList.add('hidden');
    }
  } else {
    fragmentsFinished = true;
  }

  if (fragmentsFinished) {
    /* Positions are 1-indexed, so we need to add and subtract 1 */
    var nextPosition = (position - 1 + n) % numSlides + 1;

    /* Normalize nextPosition in-case of a negative modulo result */
    nextPosition = (nextPosition - 1 + numSlides) % numSlides + 1;

    document.getElementById('slide-' + position).classList.add('hidden');
    document.getElementById('slide-' + nextPosition).classList.remove('hidden');

    updateProgress();
    updateURL();
    updateTabIndex();
  }

}

/**
 * Updates the current URL to include a hashtag of the current page number.
 */
function updateURL() {
  try {
    window.history.replaceState({}, null, '#' + currentPosition());
  } catch (e) {
    window.location.hash = currentPosition();
  }
}

/**
 * Sets the progress indicator.
 */
function updateProgress() {
  var progressBar = document.querySelector('.progress-bar');

  if (progressBar !== null) {
    var numSlides = document.getElementsByClassName('slide').length;
    var position = currentPosition() - 1;
    var percent = (numSlides === 1) ? 100 : 100 * position / (numSlides - 1);
    progressBar.style.width = percent.toString() + '%';
  }
}

/**
 * Removes tabindex property from all links on the current slide, sets
 * tabindex = -1 for all links on other slides. Prevents slides from appearing
 * out of control.
 */
function updateTabIndex() {
  var allLinks = document.querySelectorAll('.slide a');
  var position = currentPosition();
  var currentPageLinks = document.getElementById('slide-' + position).querySelectorAll('a');
  var i;

  for (i = 0; i < allLinks.length; i++) {
    allLinks[i].setAttribute('tabindex', -1);
  }

  for (i = 0; i < currentPageLinks.length; i++) {
    currentPageLinks[i].removeAttribute('tabindex');
  }
}

/**
 * Determines whether or not we are currently in full screen mode
 */
function isFullScreen() {
  return document.fullscreenElement ||
    document.mozFullScreenElement ||
    document.webkitFullscreenElement ||
    document.msFullscreenElement;
}

/**
 * Toggle fullScreen mode on document element.
 * Works on chrome (>= 15), firefox (>= 9), ie (>= 11), opera(>= 12.1), safari (>= 5).
 */
function toggleFullScreen() {
  /* Convenient renames */
  var docElem = document.documentElement;
  var doc = document;

  docElem.requestFullscreen =
    docElem.requestFullscreen ||
    docElem.msRequestFullscreen ||
    docElem.mozRequestFullScreen ||
    docElem.webkitRequestFullscreen.bind(docElem, Element.ALLOW_KEYBOARD_INPUT);

  doc.exitFullscreen =
    doc.exitFullscreen ||
    doc.msExitFullscreen ||
    doc.mozCancelFullScreen ||
    doc.webkitExitFullscreen;

  isFullScreen() ? doc.exitFullscreen() : docElem.requestFullscreen();
}

document.addEventListener('DOMContentLoaded', function() {
  // Update the tabindex to prevent weird slide transitioning
  updateTabIndex();

  // If the location hash specifies a page number, go to it.
  var page = window.location.hash.slice(1);
  if (page) {
    navigate(parseInt(page) - 1);
  }

  document.onkeydown = function(e) {
    if(e.target.tagName.toLowerCase() === 'textarea') return;
    var kc = e.keyCode;

    // left, down, H, J, backspace, PgUp - BACK
    // up, right, K, L, space, PgDn - FORWARD
    // enter - FULLSCREEN
    if (kc === 37 || kc === 40 || kc === 8 || kc === 72 || kc === 74 || kc === 33) {
      navigate(-1);
    } else if (kc === 38 || kc === 39 || kc === 32 || kc === 75 || kc === 76 || kc === 34) {
      navigate(1);
    } else if (kc === 13) {
      toggleFullScreen();
    } else if (kc === 27) {
      toggleOverview();
    }
  };

  if (document.querySelector('.next') && document.querySelector('.prev')) {
    document.querySelector('.next').onclick = function(e) {
      e.preventDefault();
      navigate(1);
    };

    document.querySelector('.prev').onclick = function(e) {
      e.preventDefault();
      navigate(-1);
    };
  }
  if (document.querySelector('.overview')) {
    document.querySelector('.overview').onclick = function(e) {
      toggleOverview();
    }
  }
  var $overlays = document.querySelectorAll('.slide-overlay');
  [].forEach.call($overlays, function($overlay) {
    $overlay.onclick = function(event) {
      navigate(parseInt(event.target.dataset.id) - currentPosition());
      toggleOverview();
    }
  });

  var $fragments = document.querySelectorAll('.fragment');
  [].forEach.call($fragments, function($fragment) {
    $fragment.classList.add('hidden');
  });

});

function toggleOverview() {
  if (window.$style !== undefined) {
    window.$style.remove();
    delete window.$style;
    document.querySelector('.slides').classList.remove('active');
  } else {
    var $slides = document.querySelector('.slides');
    $slides.classList.add('active');
    var slidesList = document.querySelectorAll('.slide-wrapper');

    var w = window,
      d = document,
      e = d.documentElement,
      g = d.getElementsByTagName('body')[0],
      x = w.innerWidth || e.clientWidth || g.clientWidth,
      y = w.innerHeight || e.clientHeight || g.clientHeight;

    window.$style = document.createElement('style');
    window.$style.innerHTML = '.slide-wrapper {width: ' + (x * 0.25) + 'px; height: ' + (y * 0.25) + 'px; } body .slide {width: ' + x + 'px; height: ' + y + 'px; position: relative; transform: scale(0.25,0.25); transform-origin: 0 0; } .slide.hidden{display: block; }';

    document.getElementsByTagName('head')[0].appendChild(window.$style);
  }
}

/**
 * NEW BUBBLES
 */
// var canvas = document.getElementById('bubbling');
var slide1 = document.getElementById("slide-1")
var canvas = document.createElement("canvas");
canvas.id = "bubbling";
slide1.appendChild(canvas);
var ctx = canvas.getContext('2d');
var particles = [];
var particleCount = 280;

for (var i = 0; i < particleCount; i++) {
  particles.push(new particle());
}

function particle() {
  this.x = Math.random() * canvas.width;
  this.y = canvas.height + Math.random() * 300;
  this.speed = .5 + Math.random();
  this.radius = Math.random() * 3;
  this.opacity = (Math.random() * 300) / 1000;
}

function loopBubbles() {
  requestAnimationFrame(loopBubbles);
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.globalCompositeOperation = 'lighter';
  for (var i = 0; i < particles.length; i++) {
    var p = particles[i];
    ctx.beginPath();
    ctx.fillStyle = 'rgba(255,255,255,' + p.opacity + ')';
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2, false);
    ctx.fill();
    p.y -= p.speed;
    if (p.y <= -10)
      particles[i] = new particle();
  }
}

// start bubbles
loopBubbles();