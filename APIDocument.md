# API Document

## Class: `Requester`
### Example
```typescript
import Requester from "path/to/Requester";

Requester.get({
    url: "path/to/request",
    params: {
        key: value
    }
}).then((res) => {
    
}, (err) => {
    
});

Requester.post({
    url: "path/to/post",
    data: "...",
    contentType: "..."
}).then((res) => {
  
}, (rej) => {
    
});
```

### API Refer

#### `static getInstance(void)`

由于类 `Requester` 使用单例模式，`getInstance()` 方法返回 `Requester` 实例

#### `get(para[, customOptions])`

-   `para`: `Object<RequesterGetArgs>`
    -   `url`: `string`
    -   `params`: `Object`

-   `customOptions`: `Object<AxiosRequestConfig>`, 用户自定义 `axios` 配置
-   return: `Promise<Object<RequesterResponseType> | Object<RequesterErrorType>>`
    -   `Object<RequesterResponseType>`
        -   `status`: `number`
        -   `data`: `any`
    -   `Object<RequesterErrorType>`
        -   `status`: `number`
        -   `errCode`: `string`
        -   `errMessage`: `string`

#### `post(para[, customOptions])`

-   `para`: `Object<RequesterPostArgs>`
    -   `url`: `string`
    -   `data`:  `any`
    -   `contentType`: `string`
-   `customOptions`: `Object<AxiosRequestConfig>`,  用户自定义 `axios` 配置

-   return: `Promise<Object<RequesterResponseType> | Object<RequesterErrorType>>`
    -   `Object<RequesterResponseType>`
        -   `status`: `number`
        -   `data`: `any`
    -   `Object<RequesterErrorType>`
        -   `status`: `number`
        -   `errCode`: `string`
        -   `errMessage`: `string`
