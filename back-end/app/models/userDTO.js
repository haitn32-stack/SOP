class UserModel {
    constructor(user) {
        this.userId = user.userId;
        this.userName = user.userName;
        this.avatar = user.avatar;
        this.fullName = user.fullName;
        this.email = user.email;
        this.gender = user.gender;
        this.dob = user.dob;
        this.mobilePhone = user.mobilePhone;
        this.jobTitle = user.jobTitle;
        this.jobCode = user.jobCode;
        this.supervisorId = user.supervisorId;
        this.locationId = user.locationId;
        this.parentDepartmentId = user.parentDepartmentId;
        this.childDepartment1Id = user.childDepartment1Id;
        this.childDepartment2Id = user.childDepartment2Id;
        this.roleId = user.roleId;
        this.isActive = user.isActive;
        this.role = user.role ? {name: user.role.name, permission: user.role.permission} : null;
    }

    // Trả về một đối tượng user "an toàn", loại bỏ các trường nhạy cảm.
    toSafeObject() {
        return {
            userId: this.userId,
            userName: this.userName,
            avatar: this.avatar,
            fullName: this.fullName,
            email: this.email,
            gender: this.gender,
            dob: this.dob,
            mobilePhone: this.mobilePhone,
            jobTitle: this.jobTitle,
            jobCode: this.jobCode,
            supervisorId: this.supervisorId,
            locationId: this.locationId,
            parentDepartmentId: this.parentDepartmentId,
            childDepartment1Id: this.childDepartment1Id,
            childDepartment2Id: this.childDepartment2Id,
            roleId: this.roleId,
            isActive: this.isActive,
            role: this.role
        };
    }

    getAccessLevel() {
        // Logic ví dụ
        if (this.role?.name === 'Admin') return 10;
        if (this.role?.name === 'Nhân viên') return 1;
        return 0;
    }
}

export default UserModel;