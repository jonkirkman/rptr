
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
			self.items      = items;
			self.container  = container;
			self.renderer   = renderer;
			self.canvas     = document.createElement('div');
			self.buffer     = [];
			self.old_range  = [];

			self.scroll_ctx = { 
				el: self.container, 
				prop: 'scrollTop',
				height: undefined,
				event: undefined
			};

			self.dummy      = document.createElement('div');
			self.dummy.className = "rptr-single";

		// this will hold our current state
		self.visible   = {};


		// we'll set these params during init
		var params = {
			count: undefined,
			item_height: undefined,
			max_items: undefined
		};

		
		this._init = function() {

			// cache the number of items
			params.count = self.items.length;
		console.log(params.count + ' items');

			// prep the container
			// self.container.style.overflow = 'auto';
			
			// add our canvas
			self.canvas.className = 'rptr-canvas';
			self.container.appendChild(self.canvas);

			// how tall do we think our items should be?
			var temp_node = self.dummy.cloneNode();
			temp_node.style.visibility = 'hidden';
			temp_node.style.top = '100%';
			temp_node.innerHTML = self.renderer(self.items[0]);
			self.canvas.appendChild(temp_node);
			params.item_height = temp_node.offsetHeight;
			self.canvas.removeChild(temp_node);
		console.log('item height: ', params.item_height);

			// resize our canvas
			self.canvas.style.height =  Math.ceil(params.count * params.item_height) + 'px';
		console.log('canvas height:', self.canvas.style.height, 'should be:', params.count * params.item_height);

			// how tall is the container?
			if (self.container.offsetHeight < window.innerHeight) {
				// use the container as the context for scrolling
				self.scroll_ctx.el     = self.container;
				self.scroll_ctx.height = self.container.offsetHeight;
				self.scroll_ctx.prop   = 'scrollTop';
			}
			else {
				// use the window as the context for scrolling
				self.scroll_ctx.el     = window;
				self.scroll_ctx.height = window.innerHeight;
				self.scroll_ctx.prop   = 'scrollY';
			}
		console.log('container height:', self.scroll_ctx.height, "window height:", window.innerHeight);
			
			// how many items can we fit in out container?
			params.max_items = Math.floor(self.scroll_ctx.height / params. item_height);
		console.log('max items:', params.max_items);

			// render our items into strings and stash 'em
			self._render(self.items, self.renderer);

			// attach our scrolling event listener
			self.scroll_ctx.event = self.scroll_ctx.el.addEventListener('scroll', _scroll, false);

			// fill 'er up
			self._scroll();
		};


		// draw the items to our buffer
		this._render = function(items, renderer) {
			for (var i = items.length - 1; i >= 0; i--) {
				self.buffer[i] = renderer(items[i]);
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

			// run through the visible items checking if any are out of range
			for (var i = keys.length -1; i >=0; i--) {
				if (keys[i] < range[0] || keys[i] > range[1]) {
					self._remove_item(keys[i]);
				}
			}
		};


		// add an item
		this._add_item = function(idx) {
			// create a DOM node for our item
			var single_item = self.dummy.cloneNode();
			single_item.style.top = idx * params.item_height + 'px';

			// shove our content into the DOM node
			single_item.innerHTML = self.buffer[idx];
			
			// add the DOM node to our canvas
			self.canvas.appendChild(single_item);

			// We need to cache a reference to the new DOM node to remove it later
			self.visible[idx] = single_item;
		};


		// remove an item
		this._remove_item = function(idx) {
			if (typeof self.visible[idx] == 'undefined') return;

			// remove the item from the DOM
			self.canvas.removeChild(self.visible[idx]);

			// delete the item from our visible group
			delete self.visible[idx];
		};


		// return the first and last items worth adding
		this._get_range = function() {
			// console.log(self.scroll_ctx.el[self.scroll_ctx.prop], self.scroll_ctx);

			// make sure we have a scroll position to work with
			var position = self.scroll_ctx.el[self.scroll_ctx.prop];

			var first = Math.max(0, Math.floor( (position / params.item_height) - Math.floor(params.max_items * 0.5) ));
			var last  = Math.min(params.count, first + params.max_items * 2);
			return [first, last];
		};


		// scrolls for lulz
		this._scroll = function() {
			var range = self._get_range();
			// console.log('scrolling', range, self.old_range.toString() == range.toString());

			// if the range hasn't changed we can ignore the event
			if (self.old_range.toString() == range.toString()) return;
			
			self.old_range = range;

			// remove the out of range items
			self._cleanup(range);

			// add the items that just came into range
			self._display(range);
		};


		return {
			// Public properties
			params: params,
			buffer: buffer,
			visible: visible,

			// Public methods
			init: _init,
			scroll: _scroll
		};
	};
})(window);

