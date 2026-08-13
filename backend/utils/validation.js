const validateName = (name) => {
    if (!name || typeof name !== "string") {
        return "Name is required.";
    }

    const length = name.trim().length;

    if (length < 20) {
        return "Name must be at least 20 characters.";
    }

    if (length > 60) {
        return "Name must not exceed 60 characters.";
    }

    return null;
};

const validateAddress = (address) => {
    if (!address || typeof address !== "string") {
        return "Address is required.";
    }

    if (address.trim().length > 400) {
        return "Address must not exceed 400 characters.";
    }

    return null;
};


const validateEmail = (email) => {
    if (!email || typeof email !== "string") {
        return "Email is required.";
    }

    const emailRegex =
        /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)+$/;

    if (!emailRegex.test(email.trim())) {
        return "Please enter a valid email address.";
    }

    return null;
};


const validatePassword = (password) => {
    if (!password || typeof password !== "string") {
        return "Password is required.";
    }

    if (password.length < 8) {
        return "Password must be at least 8 characters.";
    }

    if (password.length > 16) {
        return "Password must not exceed 16 characters.";
    }

    if (!/[A-Z]/.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
        return "Password must contain at least one special character.";
    }

    return null;
};

module.exports = {
    validateName,
    validateAddress,
    validateEmail,
    validatePassword,
};