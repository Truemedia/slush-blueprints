import {Package} from 'core/package';

import {nls} from './nls/strings';

	/** 
     * <%= packageNameCaps %> package
     * @class
     */
	export default class <%= packageNameCaps %> extends Package
	{			
		/**
		 * Autoloading hook
		 * @constructs <%= packageNameCaps %>
		 * @param {object} element - HTML element the package is tied to in the DOM.
		 * @param {object} options - JSON string of options passed from the data-options attribute.
		 */
        constructor(element, options = {})
        {
        	let resources = {nls}
        	super(element, options, resources);
        }
	}