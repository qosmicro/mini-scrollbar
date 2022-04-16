/**
 * --------------------------------------------------------------------------
 *
 * Mini Srollbar v1.0.0
 * A simple yet flexible scrollbar, by Jose Manuel Sanchez.
 * https://qosmicro.com
 *
 * --------------------------------------------------------------------------
 *
 * Base on Simple Scrollbar
 * https://github.com/TorusHelm/simple-scrollbar-reworked
 *
 * Free to use under the MIT License.
 * https://gomakethings.com/mit/
 *
 * --------------------------------------------------------------------------
 *
 * Usage:
 *
 * Add attribute 'ms-container' to any DIV.
 * Target DIV should not have position 'static'.
 * Manual binding is possible too:
 * MiniScrollbar.initElement( document.querySelector('.myClass') );
 *
 * --------------------------------------------------------------------------
 */

(function (root, factory) {
    'use strict'

    if (typeof exports === 'object') {
        module.exports = factory(window, document);
    } else {
        root.MiniScrollbar = factory(window, document);
    }

})(this, function (win, doc) {
    'use strict';

    var raf = win.requestAnimationFrame || win.setImmediate || function (c) { return setTimeout(c, 0); };

    // Initiate All Elements
    function initAll() {
        var nodes = doc.querySelectorAll('*[ms-container]');
        for (var i = 0; i < nodes.length; i++) initElement(nodes[i]);
    }

    // Initiate Element
    function initElement(element) {
        if (Object.prototype.hasOwnProperty.call(element, 'data-mini-scrollbar')) return;
        Object.defineProperty(element, 'data-mini-scrollbar', { value: new MiniScrollbar(element) });
    }

    // Constructor Function
    function minisb(element) {

        // Check If Target Allows Scrolling
        this.needY = false;
        if (window.getComputedStyle(element).overflow == 'scroll' ||
            window.getComputedStyle(element).overflow == 'auto' ||
            window.getComputedStyle(element).overflowY == 'scroll' ||
            window.getComputedStyle(element).overflowY == 'auto') {
            this.needY = true;
        }
        this.needX = false;
        if (window.getComputedStyle(element).overflow == 'scroll' ||
            window.getComputedStyle(element).overflow == 'auto' ||
            window.getComputedStyle(element).overflowX == 'scroll' ||
            window.getComputedStyle(element).overflowX == 'auto') {
            this.needX = true;
        }

        // If No Bar Is Needed... Quit
        if (!this.needY && !this.needX) return false;

        // Target Element to Apply Scroll
        this.target = element;
        this.target.classList.add('mini-scrollbar-container');

        // Main Container
        this.container = doc.createElement('div');
        this.container.setAttribute('class', 'ms-content');

        // Container Wrapper
        this.wrapper = doc.createElement('div');
        this.wrapper.setAttribute('class', 'ms-wrapper');
        this.wrapper.appendChild(this.container);

        // Check Where the Focus Is Before Moving Elements
        var currentFocus = document.activeElement;

        // Move HTML to Main Container
        while (this.target.firstChild) {
            this.container.appendChild(this.target.firstChild);
        }
        this.target.appendChild(this.wrapper);

        // Make Sure Previos Focus is Restored
        if (this.container.contains(currentFocus)) {
            currentFocus.focus();
        }

        // Calculate Scrollbar Size
        this.trackWidth = this.wrapper.clientWidth - this.container.clientWidth;
        this.trackHeight = this.wrapper.clientHeight - this.container.clientHeight;

        // Vertical Bar
        if (this.needY) {
            this.barY = '<div class="ms-scroll">';
            this.trackY = doc.createElement('div');
            this.trackY.setAttribute('class', 'ms-trackY');
            this.target.appendChild(this.trackY);
            this.trackY.insertAdjacentHTML('beforeend', this.barY);
            this.barY = this.trackY.lastChild;

            // Adjust Parent Width
            this.wrapper.style.width = 'calc(100% + ' + this.trackWidth + 'px)';

            // Leave Space When Two Bars Are Needed
            if (this.needX) this.trackY.classList.add('ms-trackYX');

        } else {
            this.container.style.overflowY = 'hidden';
        }

        // Horizontal Bar
        if (this.needX) {
            this.barX = '<div class="ms-scroll">';
            this.trackX = doc.createElement('div');
            this.trackX.setAttribute('class', 'ms-trackX');
            this.target.appendChild(this.trackX);
            this.trackX.insertAdjacentHTML('beforeend', this.barX);
            this.barX = this.trackX.lastChild;

            // Adjust Parent Width & Padding
            this.wrapper.style.height = 'calc(100% + ' + this.trackHeight + 'px)';

            // Adjust Wrapper Bottom Margin
            this.wrapper.style.marginBottom = '-' + this.trackHeight + 'px';

            // Leave Space When Two Bars Are Needed
            if (this.needY) this.trackX.classList.add('ms-trackYX');

        } else {
            this.container.style.overflowX = 'hidden';
        }

        // Start Bars
        if (this.needY) dragDealer(this.barY, this, 'y');
        if (this.needX) dragDealer(this.barX, this, 'x');
        this.moveBar();

        // Adds Listeners to Handle Scrollbar
        win.addEventListener('resize', this.moveBar.bind(this));
        this.container.addEventListener('scroll', this.moveBar.bind(this));
        this.container.addEventListener('mouseenter', this.moveBar.bind(this));

        // Adds Special resizeObserver for Content
        const resizeObserver = new ResizeObserver(entries => {
            for (let entry of entries) {
                if (entry.contentBoxSize) {
                    entry.target.parentElement.dispatchEvent(new MouseEvent('mouseenter'));
                    if (document.querySelector('.ms-grabbed') != undefined)
                        document.querySelector('.ms-grabbed').dispatchEvent(new MouseEvent('mousemove'));
                }
            }
        });
        resizeObserver.observe(this.wrapper.querySelector('.ms-content > *'));
    }

    minisb.prototype = {

        // Place Bars in Position & Size Based on Current Scroll Place
        moveBar: function (event) {
            this.totalHeight = this.container.scrollHeight;
            this.totalWidth = this.container.scrollWidth;
            this.ownHeight = this.container.clientHeight;
            this.ownWidth = this.container.clientWidth;
            this.barHeight = this.trackY ? this.trackY.clientHeight : this.ownHeight;
            this.barWidth = this.trackX ? this.trackX.clientWidth : this.ownWidth;
            this.scrollSizeY;
            this.scrollSizeX;
            this.scrollPositionY;
            this.scrollPositionX;
            var _this = this;

            // Calculate Ratios
            this.scrollRatioY = _this.ownHeight / _this.totalHeight;
            this.scrollRatioX = _this.ownWidth / _this.totalWidth;

            // Calculate Scrollbar Size
            this.trackWidth = _this.wrapper.clientWidth - _this.container.clientWidth;
            this.trackHeight = _this.wrapper.clientHeight - _this.container.clientHeight;

            // Adjust Parent Width & Padding
            this.wrapper.style.width = 'calc(100% + ' + this.trackWidth + 'px)';
            this.wrapper.style.height = 'calc(100% + ' + this.trackHeight + 'px)';

            raf(function () {

                var needYX = true;

                // Hide/Show/Resize vertical scrollbar.
                if (_this.trackY) {
                    if (_this.scrollRatioY >= 1 || _this.trackWidth == 0) {
                        _this.trackY.classList.add('ms-hidden');
                        _this.wrapper.classList.add('ms-y-hidden');
                        needYX = false;
                    } else {
                        _this.trackY.classList.remove('ms-hidden');
                        _this.wrapper.classList.remove('ms-y-hidden');
                        _this.scrollSizeY = Math.round(_this.barHeight * Math.max(_this.scrollRatioY, 0.1));
                        _this.scrollPositionY = Math.round((_this.container.scrollTop * (_this.barHeight - _this.scrollSizeY)) / (_this.totalHeight - _this.ownHeight));
                        _this.barY.style.cssText = 'height: ' + _this.scrollSizeY + 'px; top: ' + _this.scrollPositionY + 'px;';
                    }
                }

                // Hide/Show/Resize horizontal scrollbar.
                if (_this.trackX) {
                    if (_this.scrollRatioX >= 1 | _this.trackHeight == 0) {
                        _this.trackX.classList.add('ms-hidden');
                        _this.wrapper.classList.add('ms-x-hidden');
                        needYX = false;
                    } else {
                        _this.trackX.classList.remove('ms-hidden');
                        _this.wrapper.classList.remove('ms-x-hidden');
                        _this.scrollSizeX = Math.round(_this.barWidth * Math.max(_this.scrollRatioX, 0.1));
                        _this.scrollPositionX = Math.round((_this.container.scrollLeft * (_this.barWidth - _this.scrollSizeX)) / (_this.totalWidth - _this.ownWidth));
                        _this.barX.style.cssText = 'width: ' + _this.scrollSizeX + 'px; left: ' + _this.scrollPositionX + 'px;';
                    }

                    // Adjust Wrapper Bottom Margin
                    _this.wrapper.style.marginBottom = '-' + _this.trackHeight + 'px';
                }

                if (_this.trackY && _this.trackX && needYX) {
                    _this.trackY.classList.add('ms-trackYX');
                    _this.trackX.classList.add('ms-trackYX');
                } else {
                    if (_this.trackY) _this.trackY.classList.remove('ms-trackYX');
                    if (_this.trackX) _this.trackX.classList.remove('ms-trackYX');
                }
            });
        }
    }

    // Scroller Drag Handler
    function dragDealer(scroll, context, direction) {
        var lastPage;

        scroll.addEventListener('mousedown', function (event) {
            scroll.parentElement.classList.add('ms-grabbed');
            doc.body.classList.add('ms-grabbed');

            // Initial Cursor Position
            lastPage = direction === 'y' ? event.pageY : event.pageX;

            // Initial Bar Top/Left
            if (context.barY) context.scrollPositionY = parseInt(window.getComputedStyle(context.barY).top);
            if (context.barX) context.scrollPositionX = parseInt(window.getComputedStyle(context.barX).left);

            // Add Listeners
            doc.addEventListener('mousemove', drag);
            doc.addEventListener('mouseup', stop);

            return false;
        });

        function drag(event) {

            // New Cursor Position
            var newPage = direction === 'y' ? event.pageY : event.pageX;
            var delta = newPage - lastPage;
            lastPage = newPage;

            // New Bar Top
            if (direction === 'y') context.scrollPositionY += delta;
            else context.scrollPositionX += delta;


            raf(function () {
                if (direction === 'y') {
                    context.container.scrollTop = Math.round((context.scrollPositionY * (context.totalHeight - context.ownHeight)) / (context.barHeight - context.scrollSizeY));
                } else {
                    context.container.scrollLeft = Math.round((context.scrollPositionX * (context.totalWidth - context.ownWidth)) / (context.barWidth - context.scrollSizeX));
                }
            });
        }

        function stop() {
            scroll.parentElement.classList.remove('ms-grabbed');
            doc.body.classList.remove('ms-grabbed');

            doc.removeEventListener('mousemove', drag);
            doc.removeEventListener('mouseup', stop);
        }

    }

    // Start Plugin
    doc.addEventListener('DOMContentLoaded', initAll);
    minisb.initAll = initAll;
    minisb.initElement = initElement;

    var MiniScrollbar = minisb;
    return MiniScrollbar;

});