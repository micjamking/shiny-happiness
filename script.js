/**
 * Utility functions
 */
(function(
  w,  // window
  DA  // DevTools Author global
){
  'use strict';

  /** @object utils */
  var utils  = {},
      
      /**
       * Easing Functions - inspired from http://gizma.com/easing/
       */
      easing = {
        // no easing, no acceleration
        linear: function (t) { return t; },
        // accelerating from zero velocity
        easeInQuad: function (t) { return t*t; },
        // decelerating to zero velocity
        easeOutQuad: function (t) { return t*(2-t); },
        // acceleration until halfway, then deceleration
        easeInOutQuad: function (t) { return t<0.5 ? 2*t*t : -1+(4-2*t)*t; },
        // accelerating from zero velocity 
        easeInCubic: function (t) { return t*t*t; },
        // decelerating to zero velocity 
        easeOutCubic: function (t) { return (--t)*t*t+1; },
        // acceleration until halfway, then deceleration 
        easeInOutCubic: function (t) { return t<0.5 ? 4*t*t*t : (t-1)*(2*t-2)*(2*t-2)+1; },
        // accelerating from zero velocity 
        easeInQuart: function (t) { return t*t*t*t; },
        // decelerating to zero velocity 
        easeOutQuart: function (t) { return 1-(--t)*t*t*t; },
        // acceleration until halfway, then deceleration
        easeInOutQuart: function (t) { return t<0.5 ? 8*t*t*t*t : 1-8*(--t)*t*t*t; },
        // accelerating from zero velocity
        easeInQuint: function (t) { return t*t*t*t*t; },
        // decelerating to zero velocity
        easeOutQuint: function (t) { return 1+(--t)*t*t*t*t; },
        // acceleration until halfway, then deceleration 
        easeInOutQuint: function (t) { return t<0.5 ? 16*t*t*t*t*t : 1+16*(--t)*t*t*t*t; }
      };

  /**
   * easing
   * @params easingFunction Name of easing function to use
   * @params elapsedTime Length of time (ms) that has passed since start
   * @params start initial starting point
   * @params change distance to travel
   * @params duration speed of travel
   */
  utils.ease = function(easingFunction, elapsedTime, start, change, duration) {
    var time        = Math.min(1, (elapsedTime / duration)),
        easedTiming = easing[easingFunction](time);
    
    return (easedTiming * change) + start;
  };

  /**
   * Throttle an event (ie. scroll) and provide custom event for callback
   * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
   * @param {String} type - Type of event to throttle
   * @param {String} name - Name of new event to dispatchEvent
   * @param {Object} obj - Object to attach event to and dispatch the custom event from
   */
  utils.throttle = function(type, name, obj) {
      obj = obj || w;
      var running = false;
      
      var func = function() {
          if (running) { return; }
          running = true;
          requestAnimationFrame(function() {
              obj.dispatchEvent(new CustomEvent(name));
              running = false;
          });
      };
      
      obj.addEventListener(type, func);
  };

  /**
   * Check if element is currently visible in viewport
   * @see https://developer.mozilla.org/en-US/docs/Web/Events/scroll
   * @param {HTMLElement} element - DOM element to check if currently visible
   * @param {Number} percentage - The percentage of screen threshold the element must be within
   */
  utils.isElementInViewport = function(element, percentage) {
    var rect = element.getBoundingClientRect();

    percentage = percentage || 1;

    return (
        rect.bottom >= 0 &&
        rect.right  >= 0 &&
        rect.top  <= ( ( window.innerHeight || document.documentElement.clientHeight ) * percentage ) &&
        rect.left <= ( ( window.innerWidth || document.documentElement.clientWidth ) * percentage )
    );
  };

  /** @export UI */
  DA.utils = utils;
})(window, window.DA = window.DA || {});
/**
 * User Interface
 */
(function(
  w,  // window
  $,  // document.querySelectorAll
  DA  // DevTools Author global
){
  'use strict';
  
  /** @object UI */
  var UI = {};
  
  /**
   * scroll to element
   * @params targetElement Element to scroll to
   * @params duration Speed of scroll animation
   * @params callback Callback function after scroll has completed
   */
  UI.scrollTo = function(targetElement, duration, callback) {
      var currentScrollPos = document.body.scrollTop,
          distanceToScroll = targetElement.offsetTop - currentScrollPos,
          speed            = 16;
      
      // Scroll animation
      (function animateScroll(elapsedTime) {  
          elapsedTime += speed;
          document.body.scrollTop = DA.utils.ease('easeInOutQuad', elapsedTime, currentScrollPos, distanceToScroll, duration); 
          if (elapsedTime < duration) {
              w.requestAnimationFrame(function() {
                  animateScroll(elapsedTime);
              });
          } else if (elapsedTime >= duration) {
            return callback();
          }
      })(0);
  };

  /**
   * scroll to all anchors
   * @params linksArray Array of anchor elements
   */
  UI.scrollToInternalLinks = function(linksArray){
    function scrollToListener(event){
      event.preventDefault();
      
      var hash    = (event.target.href) ? event.target.getAttribute('href') : event.target.parentNode.getAttribute('href'), 
          element = $(hash)[0];
      
      function changeURLHash(){
        w.location.hash = hash;
      }
      
      UI.scrollTo(element, 1250, changeURLHash);
    }

    if (linksArray){
      for (var i = 0; i < linksArray.length; i++){
        linksArray[i].addEventListener('click', scrollToListener, true);
      }
    } else {
      console.log('No internal links found!');
    }
  };

  /**
   * Add class to element when it is scrolled in to view
   * @params {HTMLElement} elements - Array of HTML elements to watch
   */
  UI.addClassOnScrollInToView = function(elements){
      
    function toggleActiveClass(el){
      if (DA.utils.isElementInViewport(el, 0.75)) {
        el.classList.add('active');
      } else {
        el.classList.remove('active');
      }
    }

    function scrollCallback(){
      Array.prototype.forEach.call(elements, toggleActiveClass);
    }

    DA.utils.throttle('scroll', 'optimizedScroll');
    w.addEventListener('optimizedScroll', scrollCallback);
  };
  
  /**
   * Set Year
   * @params year Element to set year text within
   */
  UI.setYear = function(year){
    var date = new Date();
    if (year){
      year.innerHTML = date.getFullYear();
    }
  };

  /** @export UI */
  DA.UI = UI;
})(window, document.querySelectorAll.bind(document), window.DA = window.DA || {});
/*globals FB*/

/**
 * App
 */
(function(
  w,  // window
  $,  // document.querySelectorAll.bind(document)
  DA  // window.DA (DevTools Author global)
){
  'use strict';

  var $internalLinks = $('a[href^="#"]'),
      $panels        = $('.panel'),
      $currentYear   = $('.currentYear')[0],
      $links         = $('.share-links')[0];

  function initSocialUI(){
    if ($links){
      $links.style.display = 'block';
    }
  }

  function initUI(){
    DA.UI.setYear($currentYear);
    DA.UI.scrollToInternalLinks($internalLinks);
    DA.UI.addClassOnScrollInToView($panels);
  }

  function initSocial(){
    /**
     * Google API
     */
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = '//apis.google.com/js/platform.js';
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'google-sdk'));

    /**
     * Facebook SDK Init
     */
    window.fbAsyncInit = function() {
      FB.init({
        appId   : '1686524291587989',
        xfbml   : true,
        version : 'v2.5'
      });

      // Publish event after Facebook 
      // share has rendered (since it takes the longest)
      FB.Event.subscribe('xfbml.render', function() {
        var fbLoaded = new CustomEvent('social-loaded');
        window.dispatchEvent(fbLoaded);
      });
    };

    /**
     * Facebook SDK
     */
    (function(d, s, id){
       var js, fjs = d.getElementsByTagName(s)[0];
       if (d.getElementById(id)) {return;}
       js = d.createElement(s); js.id = id;
       js.src = '//connect.facebook.net/en_US/sdk.js';
       fjs.parentNode.insertBefore(js, fjs);
     }(document, 'script', 'facebook-jssdk'));

    /**
     * Twitter Widgets API
     */
    (function(d,s,id){
      var js, fjs = d.getElementsByTagName(s)[0];
      if(!d.getElementById(id)){
        js = d.createElement(s);
        js.id = id;
        js.src = '//platform.twitter.com/widgets.js';
        fjs.parentNode.insertBefore(js,fjs);
      }
    }(document, 'script', 'twitter-wjs'));
  }
  
  w.addEventListener('DOMContentLoaded', initUI);
  w.addEventListener('load', initSocial);
  w.addEventListener('social-loaded', initSocialUI);

})( window, document.querySelectorAll.bind(document), window.DA );
//# sourceMappingURL=script.js.map