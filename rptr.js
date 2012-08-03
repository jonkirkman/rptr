
/**
 * rptr
 * Render repeatitive elements really efficiently
 *
 */

(function( window, undefined ) {
	var document = window.document;

	window.rptr = function(container, items, renderer) {

		// See if we have what we what we need
		if (container === undefined || !Array.isArray(items) || typeof renderer !== 'function') {
			console.log('Fail!!!', container, items, typeof renderer);
			return false;
		}


		// Static properties
		var self = this;
			self.items     = items;
			self.container = container;
			self.renderer  = renderer;
			self.canvas    = document.createElement('div');
			self.buffer    = [];
			self.old_range = [];


		// this will hold our current state
		self.visible   = {};


		// we'll set these params during init
		var params = {
			count: undefined,
			container_height: undefined,
			item_height: undefined,
			max_items: undefined
		};

		
		this._init = function() {

			// cache the number of items
			params.count = self.items.length;
			
			// how tall is the container?
			params.container_height = self.container.offsetHeight;

			// how tall do we think our items should be?
			params.item_height = 30;

			// how many items can we fit in out container?
			params.max_items = Math.floor(params.container_height / params. item_height);

			// prep the container
			self.container.style.overflow = 'auto';

			// prep our canvas
			self.canvas.className = 'rptr-canvas';
			self.canvas.style.height = params.count * params.item_height;

			// add our canvas
			self.container.appendChild(self.canvas);

			// render our items into memory
			self._render(self.items, self.renderer);

			// attach our scrolling event listener
			self.container.addEventListener('scroll', _scroll, false);

			// fill 'er up
			self._scroll();
		};


		// draw the items to our buffer
		this._render = function(items, renderer) {
			for (var i = items.length - 1; i >= 0; i--) {
				self.buffer[i] = {
					el: renderer(items[i]),
					visible: false
				};
			}
		};


		// add items to our container
		this._display = function(range) {
			// console.log('display', range.toString());

			for (var i = range[1] - 1; i >= range[0]; i--) {
				// skip the items that are already there
				if (typeof self.visible[i] != 'undefined') continue;

				// add our item
				self._add_item(i);
			}
		};


		// cleanup the view by removing items that are out of range
		this._cleanup = function(range) {
			// which items are currently visible?
			var keys = Object.keys(self.visible);
			// console.log('cleanup', range.toString(), keys.toString());

			// run through the visible items and 
			for (var i = keys.length -1; i >=0; i--) {
				if (keys[i] < range[0] || keys[i] > range[1]) { 
					self._remove_item(keys[i]);
				}
			}
		};


		// add an item
		this._add_item = function(idx) {
			// create a DOM node for our item
			var single_item = document.createElement('div');
			single_item.className = "rptr-single";
			single_item.style.top = idx * params.item_height;

			// shove our content into the DOM node
			single_item.innerHTML = self.buffer[idx].el;
			
			// add the DOM node to our canvas
			self.canvas.appendChild(single_item);

			// We need to cache a reference to the new DOM node to remove it later
			self.visible[idx] = single_item;
		};


		// remove an item
		this._remove_item = function(idx) {
			if (typeof self.visible[idx] == 'undefined') {
				console.log('can not find item for removal:', idx, typeof self.visible[idx]);
				return;
			}

			// remove the item from the DOM
			self.canvas.removeChild(self.visible[idx]);

			// delete the item from our visible group
			delete self.visible[idx];
		};


		// return the 
		this._get_range = function(position) {
			var first = Math.max(0, Math.floor( (self.container.scrollTop / params.item_height) - Math.floor(params.max_items * 0.5) ));
			var last  = first + params.max_items * 2;
			// console.log("scrollTop:", self.container.scrollTop, "first:", first, "last:", last);
			return [first, last];
		};


		// scrolls for lulz
		this._scroll = function() {
			var range = self._get_range();
			// console.log('scrolling', range, self.old_range.toString() == range.toString());

			if (self.old_range.toString() == range.toString()) return;
			
			self.old_range = range;
			self._cleanup(range);
			self._display(range);
		};


		return {
			// Public properties
			params: params,
			buffer: buffer,
			visible: visible,

			// Public methods
			init: _init,
			display: _display
		};
	};
})(window);

