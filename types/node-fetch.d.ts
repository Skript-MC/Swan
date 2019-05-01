export = index;
declare function index(url: any, opts: any): any;
declare namespace index {
	class FetchError {
		constructor(message: any, type: any, systemError: any);
		message: any;
		type: any;
		code: any;
		errno: any;
	}
	class Headers {
		constructor(...args: any[]);
		append(name: any, value: any): void;
		entries(): any;
		forEach(callback: any, ...args: any[]): void;
		get(name: any): any;
		has(name: any): any;
		keys(): any;
		raw(): any;
		set(name: any, value: any): void;
		values(): any;
	}
	class Promise {
		static all(p0: any): any;
		static race(p0: any): any;
		static reject(p0: any): any;
		static resolve(p0: any): any;
		constructor(p0: any);
		then(p0: any, p1: any): any;
	}
	class Request {
		constructor(input: any, ...args: any[]);
		follow: any;
		compress: any;
		counter: any;
		agent: any;
		arrayBuffer(): any;
		blob(): any;
		buffer(): any;
		clone(): any;
		json(): any;
		text(): any;
		textConverted(): any;
	}
	class Response {
		constructor(...args: any[]);
		arrayBuffer(): any;
		blob(): any;
		buffer(): any;
		clone(): any;
		json(): any;
		text(): any;
		textConverted(): any;
	}
	function isRedirect(code: any): any;
}
