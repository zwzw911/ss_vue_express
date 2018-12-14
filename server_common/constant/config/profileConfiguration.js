/*    gene by server/maintain/generateProfileConfiguration     */ 
 
"use strict"

const profileConfiguration={
    "WHOLE_FILE_RESOURCE_PER_PERSON": {
        "BASIC": {
            "maxNum": 1000,
            "maxDiskSpaceInMb": 1000
        },
        "ADVANCED": {
            "maxNum": 2000,
            "maxDiskSpaceInMb": 2000
        }
    },
    "IMAGE_PER_ARTICLE": {
        "BASIC": {
            "maxNum": 10,
            "maxDiskSpaceInMb": 20
        },
        "ADVANCED": {
            "maxNum": 20,
            "maxDiskSpaceInMb": 40
        }
    },
    "ATTACHMENT_PER_ARTICLE": {
        "BASIC": {
            "maxNum": 10,
            "maxDiskSpaceInMb": 100
        },
        "ADVANCED": {
            "maxNum": 10,
            "maxDiskSpaceInMb": 200
        }
    },
    "IMAGE_PER_IMPEACH_OR_COMMENT": {
        "BASIC": {
            "maxNum": 5,
            "maxDiskSpaceInMb": 10
        }
    },
    "ATTACHMENT_PER_IMPEACH": {
        "BASIC": {
            "maxNum": 2,
            "maxDiskSpaceInMb": 20
        }
    },
    "IMAGE_IN_WHOLE_IMPEACH": {
        "BASIC": {
            "maxNum": 40,
            "maxDiskSpaceInMb": 80
        }
    },
    "IMAGE_PER_USER_IN_WHOLE_IMPEACH": {
        "BASIC": {
            "maxNum": 10,
            "maxDiskSpaceInMb": 20
        }
    },
    "MAX_FOLDER_NUM_PER_USER": {
        "BASIC": {
            "maxNum": 100
        },
        "ADVANCED": {
            "maxNum": 500
        }
    },
    "MAX_FRIEND_GROUP_NUM_PER_USER": {
        "BASIC": {
            "maxNum": 5
        },
        "ADVANCED": {
            "maxNum": 10
        }
    },
    "MAX_FRIEND_NUM_PER_USER": {
        "BASIC": {
            "maxNum": 500
        },
        "ADVANCED": {
            "maxNum": 1000
        }
    },
    "MAX_UNTREATED_ADD_FRIEND_REQUEST_PER_USER": {
        "BASIC": {
            "maxNum": 50
        }
    },
    "MAX_NEW_ARTICLE_PER_USER": {
        "BASIC": {
            "maxNum": 10
        }
    },
    "MAX_ARTICLE_PER_USER": {
        "BASIC": {
            "maxNum": 500
        },
        "ADVANCED": {
            "maxNum": 1000
        }
    },
    "MAX_COMMENT_PER_ARTICLE": {
        "BASIC": {
            "maxNum": 1000
        }
    },
    "MAX_COMMENT_PER_ARTICLE_PER_USER": {
        "BASIC": {
            "maxNum": 50
        }
    },
    "MAX_SIMULTANEOUS_NEW_OR_EDITING_IMPEACH_PER_USER": {
        "BASIC": {
            "maxNum": 5
        }
    },
    "MAX_REVOKE_IMPEACH_PER_USER": {
        "BASIC": {
            "maxNum": 10
        }
    },
    "MAX_SIMULTANEOUS_WAIT_FOR_ASSIGN_IMPEACH_PER_USER": {
        "BASIC": {
            "maxNum": 5
        }
    },
    "MAX_COMMENT_PER_IMPEACH_PER_USER": {
        "BASIC": {
            "maxNum": 20
        }
    },
    "MAX_PUBLIC_GROUP_NUM": {
        "BASIC": {
            "maxNum": 10
        },
        "ADVANCED": {
            "maxNum": 20
        }
    },
    "MAX_DECLINE_JOIN_REQUEST": {
        "BASIC": {
            "maxNum": 10
        }
    },
    "MAX_SEND_RECOMMENDS": {
        "BASIC": {
            "maxNum": 1000
        }
    },
    "MAX_READ_RECEIVE_RECOMMENDS": {
        "BASIC": {
            "maxNum": 1000
        },
        "ADVANCED": {
            "maxNum": 2000
        }
    }
}
module.exports={
    profileConfiguration,
}