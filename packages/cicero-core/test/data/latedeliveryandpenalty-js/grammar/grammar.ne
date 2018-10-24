# Dynamically Generated
@builtin "number.ne"
@builtin "string.ne"
@builtin "whitespace.ne"
@{%
    function compact(v) {
        if (Array.isArray(v)) {
            return v.reduce((a, v) => (v === null || v === undefined || (v && v.length === 0) ) ? a : (a.push(v), a), []);
        } else {
            return v;
        }
    }

    function flatten(v) {
        let r;
        if (Array.isArray(v)) {
            r = v.reduce((a,v) => (a.push(...((v && Array.isArray(v)) ? flatten(v) : [v])), a), []);
        } else {
            r = v;
        }
        r = compact(r);
        return r;
        }
%}


rule -> rule0 rule1 rule2 rule3 rule4 rule5 rule6 rule7 rule8 rule9 rule10 rule11 rule12 rule13 rule14 
{% ([ rule0,rule1,rule2,rule3,rule4,rule5,rule6,rule7,rule8,rule9,rule10,rule11,rule12,rule13,rule14 ]) => {
    return {
        $class: "io.clause.latedeliveryandpenalty.TemplateModel",
        clauseId : "0b06357a-737a-4ba7-b749-2df5dedf411e",
        forceMajeure : rule1,
        penaltyDuration : rule3,
        penaltyPercentage : rule5,
        capPercentage : rule11,
        termination : rule13,
        fractionalPart : rule7,
    };
}
%}

ROOT -> rule0 
{% ([ rule0 ]) => {
    return {
        
        
    };
}
%}



rule0 -> "Late Delivery and Penalty. In case of delayed delivery" 


rule1 -> " except for Force Majeure cases,":? {% (d) => {return d[0] !== null;}%} # forceMajeure 


rule2 -> " the Seller shall pay to the Buyer for every " 


rule3 -> Duration {% id %} # penaltyDuration 


rule4 -> " of delay penalty amounting to " 


rule5 -> Double {% id %} # penaltyPercentage 


rule6 -> "% of the total value of the Equipment whose delivery has been delayed. Any fractional part of a " 


rule7 -> TemporalUnit {% id %} # fractionalPart 


rule8 -> " is to be considered a full " 


rule9 -> TemporalUnit {% id %} # fractionalPart 


rule10 -> ". The total amount of penalty shall not however, exceed " 


rule11 -> Double {% id %} # capPercentage 


rule12 -> "% of the total value of the Equipment involved in late delivery. If the delay is more than " 


rule13 -> Duration {% id %} # termination 


rule14 -> ", the Buyer is entitled to terminate this Contract." 


TemplateModel -> Boolean  __  Duration  __  Double  __  Double  __  Duration  __  TemporalUnit  __  String 

{% ( data ) => {
    return {
        $class: "io.clause.latedeliveryandpenalty.TemplateModel",
        forceMajeure : data[0],
        penaltyDuration : data[2],
        penaltyPercentage : data[4],
        capPercentage : data[6],
        termination : data[8],
        fractionalPart : data[10],
        clauseId : data[12]
    };
}
%}


LateDeliveryAndPenaltyRequest -> Boolean  __  DateTime  __  DateTime:?  __  Double  __  String  __  DateTime 

{% ( data ) => {
    return {
        $class: "io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest",
        forceMajeure : data[0],
        agreedDelivery : data[2],
        deliveredAt : data[4],
        goodsValue : data[6],
        transactionId : data[8],
        timestamp : data[10]
    };
}
%}


LateDeliveryAndPenaltyResponse -> Double  __  Boolean  __  String  __  DateTime 

{% ( data ) => {
    return {
        $class: "io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse",
        penalty : data[0],
        buyerMayTerminate : data[2],
        transactionId : data[4],
        timestamp : data[6]
    };
}
%}


Status -> "ON" {% id %} | "OFF" {% id %} 


Child -> String 

{% ( data ) => {
    return {
        $class: "org.accord.test.Child",
        name : data[0]
    };
}
%}


Foo -> String  __  String  __  String  __  Double  __  Long  __  DateTime  __  Boolean  __  Status  __  Integer  __  Child 

{% ( data ) => {
    return {
        $class: "org.accord.test.Foo",
        bar : data[0],
        p : data[2],
        a : data[4],
        d : data[6],
        l : data[8],
        t : data[10],
        b : data[12],
        s : data[14],
        i : data[16],
        child : data[18]
    };
}
%}


TemporalUnit -> "seconds" {% id %} | "minutes" {% id %} | "hours" {% id %} | "days" {% id %} | "weeks" {% id %} | "years" {% id %} 


Duration -> Long  __  TemporalUnit 

{% ( data ) => {
    return {
        $class: "org.accordproject.time.Duration",
        amount : data[0],
        unit : data[2]
    };
}
%}


AccordContractState -> String  __  String 

{% ( data ) => {
    return {
        $class: "org.accordproject.cicero.contract.AccordContractState",
        stateId : data[0],
        contract : data[2]
    };
}
%}


Payload -> AccordContract  __  Request  __  AccordContractState:? 

{% ( data ) => {
    return {
        $class: "org.accordproject.cicero.runtime.Payload",
        contract : data[0],
        request : data[2],
        state : data[4]
    };
}
%}


Success -> Response  __  AccordContractState  __  Event:+ 

{% ( data ) => {
    return {
        $class: "org.accordproject.cicero.runtime.Success",
        response : data[0],
        state : data[2],
        emit : data[4]
    };
}
%}


Failure -> ErrorResponse 

{% ( data ) => {
    return {
        $class: "org.accordproject.cicero.runtime.Failure",
        error : data[0]
    };
}
%}



# Basic types
NUMBER -> [0-9] 
{% (d) => {return parseInt(d[0]);}%}

DOUBLE_NUMBER -> NUMBER NUMBER
{% (d) => {return '' + d[0] + d[1]}%}

MONTH -> DOUBLE_NUMBER
DAY -> DOUBLE_NUMBER
YEAR -> DOUBLE_NUMBER DOUBLE_NUMBER
{% (d) => {return '' + d[0] + d[1]}%}

DATE -> MONTH "/" DAY "/" YEAR
{% (d) => {return '' + d[4] + '-' + d[0] + '-' + d[2]}%}

Word -> [\S]:*
{% (d) => {return d[0].join('');}%}

BRACKET_PHRASE -> "[" Word (__ Word):* "]" {% ((d) => {return d[1] + ' ' + flatten(d[2]).join(" ");}) %}

String -> dqstring {% id %}
Double -> decimal {% id %}
Integer -> int {% id %}
Long -> int {% id %}
Boolean -> "true" {% id %} | "false" {% id %}
DateTime -> DATE  {% id %}