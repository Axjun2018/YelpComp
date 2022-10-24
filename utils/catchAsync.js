// export and act like: catchAsync(func), it run catch clause on this func
module.exports = func => { // pass func to return a new function that executed func with error catcher
    return (req, res, next)=>{
        func(req, res, next).catch(next);
    }
}