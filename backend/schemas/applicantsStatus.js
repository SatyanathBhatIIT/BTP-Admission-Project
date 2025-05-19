const applicantsStatusSchema = (branch) => `
    (
        COAP VARCHAR(200) NOT NULL,
        Offered text,
        Accepted text,        
        OfferCat text,
        IsOfferPwd text,
        OfferedRound text,
        RetainRound text,
        RejectOrAcceptRound text,
        ManualUpdate text,
        branch VARCHAR(255) DEFAULT '${branch}',
        AppNo VARCHAR(200) NOT NULL UNIQUE,
        FOREIGN KEY (AppNo) REFERENCES mtechappl (AppNo)
    )
`;

module.exports = { applicantsStatusSchema };
