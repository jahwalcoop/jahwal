// Define a middleware function to be used for every secured routes
exports.freepass = function (req, res, next) {
    if (!req.isAuthenticated()) {
        next();
    } else {
        next();
    }
};

exports.requiresLogin = function (req, res, next) {
    if (!req.isAuthenticated()) {
        res.send(401);
    } else {
        next();
    }
};

exports.admin = {
    hasAuthorization: function (req, res, next) {
        //조합원인경우 접근이 되지 않음
        var memberClass = req.user.MemberClass;
        if (('관리자' == memberClass) || ('실무자' == memberClass) || ('이사장' == memberClass) || ('센터장' == memberClass)) {
            next()
        } else {
            console.log(req.user.MemberClass);
            req.session = null;
            res.send(401);
        }
    }
}

exports.charman = {
    hasAuthorization: function (req, res, next) {
        console.log(req.user);
        if (('이사장' != req.user.MemberClass)) {
            console.log(req.user.MemberClass);
            req.session = null;
            res.send(401);
        }
        next()
    }
}

exports.manager = {
    hasAuthorization: function (req, res, next) {
        console.log(req.user);
        if (('센터장' != req.user.MemberClass)) {
            console.log(req.user.MemberClass);
            req.session = null;
            res.send(401);
        }
        next()
    }
}



