
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


		// this will hold our current state
		self.visible   = [];


		// we'll set these params during init
		var params = {
			count: undefined,
			container_height: undefined,
			item_height: undefined,
			max_items: undefined
		};

		
		this._init = function() {
			console.log('running init');

			// cache the number of items
			params.count = self.items.length;
			
			// how tall is the container?
			params.container_height = self.container.offsetHeight;

			// how tall do we think our items should be?
			params.item_height = 14;

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
		this._display = function() {
			var first = Math.max(0, Math.floor( (self.container.scrollTop / params.item_height) - Math.floor(params.max_items * 0.5) ));
			var last  = first + params.max_items * 2;
			console.log("scrollTop: ", self.container.scrollTop, "first:", first, "last:", last);

			for (var i = last - 1; i >= first; i--) {
				var single_item = document.createElement('div');
				single_item.className = "rptr-single";
				single_item.style.top = i * params.item_height;
				single_item.innerHTML = self.buffer[i].el;
				self.canvas.appendChild(single_item);
			}
		};


		// scrolls for lulz
		this._scroll = function() {
			console.log('scrollity');
		};


		return {
			// Public properties
			params: params,
			buffer: buffer,

			// Public methods
			init: _init,
			display: _display
		};
	};
})(window);

