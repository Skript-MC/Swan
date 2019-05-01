declare module "*.json" {
    const value: any;
    export default value;
}

declare module "json!*" {
    const value: any;
    export default value;
}

declare module 'node-fetch';
