/*
 * Copyright (c) 2014 Samsung Electronics Co., Ltd. All rights reserved.
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

/* global define */

/**
 * XMLHttpRequest helper module.
 *
 * @namespace helpers/XMLHttpRequest
 * @memberof helpers
 */

define({
    name: 'helpers/date',
    def: function helpersDate() {
        'use strict';
        var XMLHttpRequest = null;
        
        function onProgress(event) {
            if (event.lengthComputable) {
                var percentComplete = (event.loaded / event.total)*100;
                console.log("Téléchargement: %d%%", percentComplete);
            } else {
                // Impossible de calculer la progression puisque la taille totale est inconnue
            }
        }

        function onError(event) {
            console.error("Une erreur " + event.target.status + " s'est produite au cours de la réception du document.");
        }

        function onLoad(event) {
            // Ici, this.readyState égale XMLHttpRequest.DONE .
            if (this.status === 200) {
                console.log("Réponse reçue: %s", this.responseText);
            } else {
                console.log("Status de la réponse: %d (%s)", this.status, this.statusText);
            }
        }

        function onLoadEnd(event) {
            // Cet événement est exécuté, une fois la requête terminée.
            console.log("Le transfert est terminé. (peut importe le résultat)");
        }
        
        
        function setXMLHttpRequest(XMLHttpRequest){
        	XMLHttpRequest = XMLHttpRequest;
        }
        function getXMLHttpRequest(XMLHttpRequest){
        	return XMLHttpRequest;
        }
        function start(){
        	
        }
        function init() {
        	if (XMLHttpRequest === null ){
        		XMLHttpRequest = new XMLHttpRequest();
        	}
        	
        	XMLHttpRequest.onprogress = onProgress;
        	XMLHttpRequest.onerror = onError;
        	XMLHttpRequest.onload = onLoad;
        	XMLHttpRequest.onloadend = onLoadEnd;

        	XMLHttpRequest.open('GET', 'http://www.mozilla.org/', true);
        	XMLHttpRequest.send(null);

		}
        return {
        	getDate: getDate,
        	setXMLHttpRequest: setXMLHttpRequest
        };
    }
});
