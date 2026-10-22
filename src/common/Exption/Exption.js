
export const ApllicationExption=({message = "error" ,option={status : 400} })=>{
    throw new Error(message , {cause:option})

}
export const NotFoundExcption=(message = "NotFound" , extra={})=>{
return ApllicationExption({
    message,
    option:{
        status:404,
        ...extra
    }
})
}
export const ForbiddenExption=(message = "Forbidden" , extra={})=>{
    return ApllicationExption({
        message,
        option:{
            status:403,
            ...extra
        }
    })

}

export const UnauthroziedExption=(message = "Unauthorized" , extra={})=>{
    return ApllicationExption({
        message,
        option:{
            status:401,
            ...extra
        }
    })

}

export const ConflictExption=(message ="Conflict" , extra ={})=>{
    return ApllicationExption({
        message, 
        option:{
            status:409,
            ...extra
        }
    })
    
}
export const TooManyRequestsExption=(message = "TooManyRequests" , extra={})=>{
    return ApllicationExption({
        message,
        option:{
            status:429,
           ...extra
        }
    })
}

export const BadRequestExcption=(message ="BadRequest" , extra={})=>{
    return ApllicationExption({
        message,
        option:{
            status:400,
            extra
        }
    })

}
