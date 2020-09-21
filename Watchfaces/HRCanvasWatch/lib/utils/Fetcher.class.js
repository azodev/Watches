class Fetcher {
	constructor(url){
		this.url = url;
		
	}
	async load(params){
		this.url = this.url + params.join('&');
		this.response = await fetch(this.url);
		this.data = await this.response.json();
		return this.data;
	}
}