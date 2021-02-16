/*
 * Copyright (c) 2015 Samsung Electronics Co., Ltd. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* global console, define */

/**
 * App module.
 *
 * @module app
 * @requires {@link views/init}
 * @namespace app
 */

define({
    name: 'app',
    requires: [
        'views/init'
    ],
    def: function appInit() {
        'use strict'; 

        console.log('app::def');

        /**
         * Initializes App module.
         *   
         * @memberof app   
         * @public 
         */
        function init() {
            console.log('app::init'); 
            var currentLanguage = null;
            var defaultLenguage = "en";
            var supportedLanguages = ["en", "fr", "ru", "de", "it", "ja"];

	        tizen.systeminfo.getPropertyValue("LOCALE", function(locale) {
                var tmp = locale.language.substring(0,2); 
                if(supportedLanguages.indexOf(tmp) > -1) {
                       currentLanguage = tmp;
                } else {
                       currentLanguage = defaultLanguage;
                }
                console.log(currentLanguage);
                /*$.getJSON("/locales/"+currentLanguage+".json", function(json) {
                    localStrings = json;
                    console.log(localStrings);
                    
                });*/
	        	
	        });
        }

        return {
            init: init
        };
    }
});
/*
async function getdirectoryItems(client) {
	  var obj = await   client.getDirectoryContents("/");
	  return obj;
	}*/
/*function write(message) {
	tizen.filesystem.resolve("documents", function(dir) {
		file = dir.resolve("newDir/newFilePath.txt");
		file.openStream("a", function(fs) {
			fs.write(message+'\n');
			fs.close();
		}, function(e) {
			console.error("Error " + e.message);
		}, "UTF-8");
	});

}
function read() {
	tizen.filesystem.resolve("documents", function(dir) {
		file = dir.resolve("newDir/newFilePath.txt");
		file.openStream("r", function(fs) {
			var text = fs.read(file.fileSize);
			fs.close();
			console.log(text);
		}, function(e) {
			console.error("Error " + e.message);
		}, "UTF-8");
	});
}*/
