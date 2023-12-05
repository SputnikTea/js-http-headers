// Some musings about how to format this

enum Headers  {
    Accept = "Accept"
    //...
}

enum MediaType  {
    Json = "application/json",
    Xml = "application/xml",
    Html = "text/html",
    Plain = "text/plain",
}
//...




enum HeaderKeys {
    Accept = "Accept"
}

interface Header {
    key: HeaderKeys;
}


// We pretty much decided this will be overkill : 
namespace Headers {
    export namespace Accept  {
        export const key = HeaderKeys.Accept;
        export enum Values  {
            Json = "application/json",
            Xml = "application/xml",
            Html = "text/html",
            Plain = "text/plain",
        }

        export namespace Values {
            export const all = ()=> {
                return 1;
            }
        }
    
    }
    
}

Headers.OtherAccept.values.a



namespace Headers {
    export namespace Other  {
        export const key = "Accept";
        export enum Values  {
            Json = "application/json",
            Xml = "application/xml",
            Html = "text/html",
            Plain = "text/plain",
        }
    }
    
}

function setHeader(header: Headers, value) {

}


Headers.Accept
Headers.Accept.Values.all()


Headers.Other