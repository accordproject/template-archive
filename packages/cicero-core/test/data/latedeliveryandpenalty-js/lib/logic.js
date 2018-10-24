/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/* "standard library" (implementation of unary and binary operators) */
function unwrap(doc) {
    // Unwrap for Enhanced TxStore format
    if ("state" in doc && !("$class" in doc)) {
        if (doc.state == "COMMITTED")
            return JSON.parse(doc.currentValue);
        else
            return null; // Not sure if we will need something more fancy for un-committed data
    }
    // Leave as-is
    else
        return doc;
}
function concat(r1, r2) {
    var result = { };
    for (var key1 in r1)
        result[key1] = r1[key1];
    for (var key2 in r2)
        if (!(key2 in r1))
            result[key2] = r2[key2];
    return result;
}
function contains(v, b) {
    for (var i=0; i<b.length; i++)
        if (equal(v, toLeft(b[i])))
            return true;
    return false;
}
function distinct(b) {
    var result = [ ];
    for (var i=0; i<b.length; i++) {
        var v = b[i];
        var dup = false;
        for (var j=0; j<result.length;j++) {
            if (equal(v,result[j])) { dup = true; break; }
        }
        if (!(dup)) { result.push(v); } else { dup = false; }
    }
    return result;
}
function fastdistinct(b) {
    b1 = b.slice(); /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
    b1.sort(compare);
    var result = [ ];
    var v1 = null;
    var v2 = null;
    for (var i=0; i<b1.length; i++) {
        var v1 = b1[i];
        if (i == (b1.length -1)) {
            result.push(v1);
        }
        else {
            v2 = b1[i+1];
            if (equal(v1,v2)) {
            } else {
                result.push(v1);
            }
            v1 = v2;
        }
    }
    return result;
}
function compare(v1, v2) {
    var t1 = typeof v1, t2 = typeof v2;
    if (t1 != t2)
        return t1 < t2 ? -1 : +1;
    var a1 = {}.toString.apply(v1), a2 = {}.toString.apply(v2);
    if (a1 != a2)
        return a1 < a2 ? -1 : +1;
    if (a1 == "[object Array]") {
        v1 = v1.slice(); /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
        v2 = v2.slice(); /* So we do the sort/compare on a clone of the original array */
        v1.sort(compare);
        v2.sort(compare);
    }
    if (t1 == "object") {
        var fields1 = [];
        var fields2 = [];
        for (var f1 in v1) { fields1.push(f1); }
        for (var f2 in v2) { fields2.push(f2); }
        fields1 = fields1.sort(compare);
        fields2 = fields2.sort(compare);
        for (var i = 0; i < fields1.length; i++) {
            if (!(fields1[i] in v2))
                return -1;
            var fc = compare(v1[fields1[i]], v2[fields1[i]]);
            if (fc != 0)
                return fc;
        }
        for (var i = 0; i < fields2.length; i++) {
            if (!(fields2[i] in v1))
                return +1;
        }
        return 0;
    }
    if (v1 != v2)
        return v1 < v2 ? -1 : +1;
    return 0;
}
function equal(v1, v2) {
    return compare(v1, v2) == 0;
}
function compareOfMultipleCriterias(scl) {
    return function(a,b) {
        var current_compare = 0;
        for (var i=0; i<scl.length; i++) {
            var sc = scl[i];
            if ("asc" in sc) { current_compare = compare(deref(a,sc['asc']), deref(b,sc['asc'])); }
            else if ("desc" in sc) { current_compare = -(compare(deref(a,sc['asc']), deref(b,sc['asc']))); }

            if (current_compare == -1) { return -1; }
            else if(current_compare == 1) { return 1; }
        }
        return current_compare;
    }
    
}
function sort(b,scl) {
    var result = [ ];
    if (scl.length == 0) { return b; } // Check for no sorting criteria
    var compareFun = compareOfMultipleCriterias(scl);
    result = b.slice(); /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
    result.sort(compareFun);
    return result;
}
function flatten(aOuter) {
    var result = [ ];
    for (var iOuter=0, nOuter=aOuter.length; iOuter<nOuter; iOuter++) {
        var aInner = aOuter[iOuter];
        for (var iInner=0, nInner=aInner.length; iInner<nInner; iInner++)
            result.push(aInner[iInner]);
    }
    return result;
}
function mergeConcat(r1, r2) {
    var result = { };
    for (var key1 in r1)
        result[key1] = r1[key1];
    for (var key2 in r2) {
        if (key2 in r1) {
            if (!equal(r1[key2], r2[key2])) {
                return [ ];
            }
        } else {
            result[key2] = r2[key2];
        }
    }
    return [ result ];
}
function project(r1, p2) {
    var result = { };
    for (var key1 in r1) {
        if (!(p2.indexOf(key1) == -1))
            result[key1] = r1[key1];
    }
    return result;
}
function remove(r, f) {
    var result = { };
    for (var key in r)
        if (key != f)
            result[key] = r[key];
    return result;
}
function sum(b) {
    var result = 0;
    for (var i=0; i<b.length; i++)
        result += b[i];
    return result;
}
function arithMean(b) {
    var len = b.length;
    if(len == 0) {
        return 0;
    } else {
        return sum(b)/len;
    }
}
function toString(v) {
    return toStringQ(v, "");
}
function toStringQ(v, quote) {
    if (v === null)
        return "null";
    var t = typeof v;
    if (t == "string")
        return quote + v + quote;
    if (t == "boolean")
        return "" + v;
    if (t == "number") {
        if (Math.floor(v) == v) return (new Number(v)).toFixed(1); // Make sure there is always decimal point
        else return "" + v;
    }
    if ({}.toString.apply(v) == "[object Array]") {
        v = v.slice();
        v.sort();
        var result = "[";
        for (var i=0, n=v.length; i<n; i++) {
            if (i > 0)
                result += ", ";
            result += toStringQ(v[i], quote);
        }
        return result + "]";
    }
    if(v.hasOwnProperty('nat')){
        return "" + v.nat;
    }
    var result2 = "{";
    var first = true;
    for (var key in v) {
        if (first) first = false; else result2 += ", ";
        result2 += toStringQ(key, quote) + ": " + toStringQ(v[key], quote);
    }
    return result2 + "}";
}
function bunion(b1, b2) {
    var result = [ ];
    for (var i1=0; i1<b1.length; i1++)
        result.push(b1[i1]);
    for (var i2=0; i2<b2.length; i2++)
        result.push(b2[i2]);
    return result;
}
function bminus(b1, b2) {
    var result = [ ];
    var v1 = b1.slice();
    var v2 = b2.slice();
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1++) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) == 1)) i2++;
        if (i2 < length2) {
            if(compare(v1[i1],v2[i2]) == (-1)) { result.push(v1[i1]); } else { i2++; }
        } else {
            result.push(v1[i1]);
        }
    }
    return result;
}
function bmin(b1, b2) {
    var result = [ ];
    var v1 = b1.slice();
    var v2 = b2.slice();
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1++) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) == 1)) i2++;
        if (i2 < length2) {
            if(compare(v1[i1],v2[i2]) == 0) result.push(v1[i1]);
        }
    }
    return result;
}
function bmax(b1, b2) {
    var result = [ ];
    var v1 = b1.slice();
    var v2 = b2.slice();
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1++) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) == 1)) { result.push(v2[i2]); i2++; }
        if (i2 < length2) {
            if(compare(v1[i1],v2[i2]) == 0) i2++;
        }
        result.push(v1[i1]);
    }
    while (i2 < length2) { result.push(v2[i2]); i2++; }
    return result;
}
function sub_brand(b1,b2) {
    var bsub=null;
    var bsup=null;
    var inh = [];
    if (inheritance) { inh = inheritance; };
    for (var i=0; i<inh.length; i++) {
        bsub = inh[i].sub;
        bsup = inh[i].sup;
        if ((b1 == bsub) && (b2 == bsup)) return true;
    }
    return false;
}
function left(v) {
    return { left : v };
}
function right(v) {
    return { right : v };
}
function mustBeArray(obj) {
    if (Array.isArray(obj))
        return;
    var e = new Error("Expected an array but got: " + JSON.stringify(obj));
    throw e;
}
function cast(brands,v) {
    mustBeArray(brands);
    if ("$class" in v)
        return enhanced_cast(brands,v);
    var type = v.type;
    mustBeArray(type);
    if (brands.length == 1 && brands[0] == "Any") { /* cast to top of inheritance is built-in */
        return left(v);
    }
    brands:
    for (var i in brands) {
        var b = brands[i];
        for (var j in type) {
            var t = type[j];
            if (equal(t,b) || sub_brand(t,b))
                continue brands;
        }
        /* the brand b does not appear in the type, so the cast fails */
        return right(null);
    }
    /* All brands appear in the type, so the cast succeeds */
    return left(v);
}
function enhanced_cast(brands,v) {
    var type = v.$class;
    if (brands.length != 1)
        throw "Can't handle multiple brands yet";
    var brand = brands[0];
    if (brand == type || brand == "Any" || sub_brand(type, brand)) {
        return left(v);
    }
    return right(null);
}
function singleton(v) {
    if (v.length == 1) {
        return left(v[0]);
    } else {
        return right(null); /* Not a singleton */
    }
}
function unbrand(v) {
    if (typeof v === "object")
        if ("$class" in v) {
            return remove(v,"$class");
        } else {
            return ("data" in v) ? v.data : v;
        }
    throw "TypeError: unbrand called on non-object";
}
function brand(b,v) {
    v['$class'] = b[0];
    return v
}
function either(v) {
    if (v == null)
        return false;
    if (typeof v === "object")
        return !("right" in v);
    return true;
}
function toLeft(v) {
    if (typeof v === "object") {
        if ("left" in v)
            return v.left;
        if ("$value" in v)
            return v.$value;
        if (looksLikeRelationship(v))
            return v["key"];
    }
    return v;
}
function toRight(v) {
    if (v === null)
        return null;
    if (typeof v === "object" && "right" in v)
        return v.right;
    return undefined;
}
function deref(receiver, member) {
    if (typeof receiver === "object" && member in receiver) {
        var ans = receiver[member];
        if (ans === null) {
            return null;
        }
        if (typeof ans === "object" && looksLikeRelationship(ans))
            ans = left(ans["key"]);
        if (("$class" in receiver) && typeof ans === "object" && !("left" in ans) && !Array.isArray(ans))
            ans = left(ans);
        return ans;
    }
    return undefined;
}
function looksLikeRelationship(v) {
    // As the name suggests, this is only heuristic.  We call it a relationship if it has two or three members.
    // A "key" and "type" member must be among those.   A third member, if present, must be $class and must denote
    // the relationship class.
    var hasKey = false;
    var hasType = false;
    for (var member in v)
        if (member == "key")
            hasKey = true;
    else if (member == "type")
        hasType = true;
    else if (member == "$class" && v["$class"] == "com.ibm.ia.model.Relationship")
        continue;
    else
        return false;
    return hasKey && hasType;
}
function mkWorld(v) {
    return { "WORLD" : v };
}

// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions
function escapeRegExp(string){
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}

// Nat operations

function natPlus(v1, v2) {
    return { "nat" : v1.nat + v2.nat };
}
function natMinus(v1, v2) {
    return { "nat" : v1.nat - v2.nat };
}
function natMult(v1, v2) {
    return { "nat" : v1.nat * v2.nat };
}
function natDiv(v1, v2) {
    return { "nat" : Math.floor(v1.nat / v2.nat) };
}
function natDiv(v1, v2) {
    return { "nat" : Math.floor(v1.nat / v2.nat) };
}
function natRem(v1, v2) {
    return { "nat" : Math.floor(v1.nat % v2.nat) };
}
function natMin(v1, v2) {
    return { "nat" : Math.min(v1.nat,v2.nat) };
}
function natMax(v1, v2) {
    return { "nat" : Math.max(v1.nat,v2.nat) };
}
function natAbs(v) {
    return { "nat" : Math.abs(v.nat) };
}
function natLog2(v) {
    return { "nat" : Math.floor(Math.log2(v.nat)) }; // Default Z.log2 is log_inf, biggest integer lower than log2
}
function natSqrt(v) {
    return { "nat" : Math.floor(Math.sqrt(v.nat)) }; // See Z.sqrt biggest integer lower than sqrt
}
function natSum(b) {
    var result = 0;
    for (var i=0; i<b.length; i++)
        result += b[i].nat;
    return { "nat" : result };
}
function natMinApply(b) {
    var numbers = [ ];
    for (var i=0; i<b.length; i++)
        numbers.push(b[i].nat);
    return { "nat" : Math.min.apply(Math,numbers) };
}
function natMaxApply(b) {
    var numbers = [ ];
    for (var i=0; i<b.length; i++)
        numbers.push(b[i].nat);
    return { "nat" : Math.max.apply(Math,numbers) };
}
function natArithMean(b) {
    var len = b.length;
    if(len == 0) {
        return { "nat" : 0 };
    } else {
        return { "nat" : Math.floor(natSum(b)/len) };
    }
}
function count(v) {
    //return { "nat" : v.length };
    return v.length; /* XXX To be fixed */
}
function floatOfNat(v) {
    return v.nat;
}
function substring(v, start, len) {
    return v.substring(start,len);
}
function substringNoLength(v, start) {
    return v.substring(start);
}
/* Addendum to for dateTime and duration */

var DAY = "day";
var MONTH = "month";
var QUARTER = "quarter";
var YEAR = "year";

function dateTimeComponent(part, date) {
    date = mustBeDate(date);
    switch(part) {
    case DAY:
        return date.dayOfMonth();
    case MONTH:
        return date.month();
    case YEAR:
        return date.year();
    case QUARTER:
        return date.quarter();
    default:
        throw new Error("Unknown date part: " + part);
    }
}

function dateTimeFromString(stringDate) {
    return moment(stringDate);
}

function dateTimeDurationFromString(stringDuration) {
    // TODO verify what the string format for durations is going to be.
    // Here we assume a number adjoined to a valid unit with a dash.
    if (typeof stringDuration === "string") {
	      parts = stringDuration.split("-");
	      if (parts.length === 2) {
	          mustBeUnit(parts[1]);
            return moment.duration(parseFloat(parts[0]),parts[1]+"s");
        }
    }
    throw new Error("Not well formed duration input: " + stringDuration);
}

function dateTimePointPlus(date, duration) {
    date = mustBeDate(date);
    duration = mustBeDuration(duration);
    return date.add(duration);
}

function dateTimePointMinus(date, duration) {
    date = mustBeDate(date);
    duration = mustBeDuration(duration);
    return date.substract(duration);
}

function dateTimePointNe(date1, date2) {
    return compareDates(date1, date2) != 0;
}

function dateTimePointLt(date1, date2) {
    return compareDates(date1,date2) < 0;
}

function dateTimePointLe(date1, date2) {
    return compareDates(date1, date2) <= 0;
}

function dateTimePointGt(date1, date2) {
    return compareDates(date1, date2) > 0;
}

function dateTimePointGe(date1, date2) {
    return compareDates(date1, date2) >= 0;
}

function dateTimeDurationBetween(date1, date2) {
    date1 = mustBeDate(date1);
    date2 = mustBeDate(date2);
    return date1.diff(date2,'days');
}

function compareDates(date1, date2) {
    date1 = mustBeDate(date1);
    date2 = mustBeDate(date2);
    if (date1.isBefore(date2)) {
        return -1;
    } else if (date1.isAfter(date2)) {
        return 1;
    } else if (date1.isSame(date2)) {
        return 0;
    }
    throw new Error("Unexpected failure: compareDates")
}

function dateNewYear(date, year) {
    date = mustBeDate(date);
    return date.year(year);
}

function dateNewMonth(date, month) {
    date = mustBeDate(date);
    return date.month(month);
}

function dateNewDay(date, day) {
    date = mustBeDate(date);
    return date.day(day);
}

function makeDate(year, month, day) {
    return moment({ 'year' :year, 'month' :month, 'day' :day });
}

function mustBeDate(date) {
    if (typeof date == "string") {
        return moment(date);
    } else {
        return date.clone();
    }
}

function mustBeDuration(duration) {
    if (typeof duration == "string") {
        return moment.duration(duration);
    } else {
        return duration.clone();
    }
}

function mustBeUnit(unit) {
    if (unit === DAY || unit === MONTH || unit === QUARTER || unit === YEAR)
	      return;
    throw new Error("Expected a duration unit but got " + JSON.stringify(unit));
}

'use strict';
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/


/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest} context.request - the incoming request
 * @param {io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse} context.response - the response
 * @AccordClauseLogic
 */
function LateDeliveryAndPenalty_latedeliveryandpenalty(context) {
  let pcontext = { 'request' : serializer.toJSON(context.request,{permitResourcesForRelationships:true}), 'state': serializer.toJSON(context.state,{permitResourcesForRelationships:true}), 'contract': context.contract, 'emit': context.emit, 'now': context.now};
  let result = new LateDeliveryAndPenalty().latedeliveryandpenalty(pcontext);
  if (result.hasOwnProperty('left')) {
    //logger.info('ergo result'+JSON.stringify(result))
    context.response = serializer.fromJSON(result.left.response, {validate: false, acceptResourcesForRelationships: true},{permitResourcesForRelationships:true});
    context.state = serializer.fromJSON(result.left.state, {validate: false, acceptResourcesForRelationships: true});
    let emitResult = [];
    for (let i = 0; i < result.left.emit.length; i++) {
      emitResult.push(serializer.fromJSON(result.left.emit[i], {validate: false, acceptResourcesForRelationships: true}));
    }
    context.emit = emitResult;
    return context;
  } else {
    throw new Error(result.right);
  }
}
class LateDeliveryAndPenalty {
  main(context) {
    var vnow = deref(context, "now");
    var vemit = deref(context, "emit");
    var vstate = deref(context, "state");
    var vcontract = deref(context, "contract");
    var vrequest = deref(context, "request");
    var vlcontract_0 = vcontract;
    var vlstate_0 = vstate;
    var vlemit_0 = vemit;
    var vX$match0 = vrequest;
    var res3 = null;
    if (either(cast(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"],vX$match0))) {
      var vX$main = null;
      vX$main = toLeft(cast(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"],vX$match0));
      var vrequest_0 = vX$main;
      var vlcontract = vcontract;
      var vlstate = vstate;
      var vlemit = vemit;
      var vagreed = deref(unbrand(vrequest_0), "agreedDelivery");
      var vp2 = vnow;
      var vp1 = vagreed;
      var t2;
      if (!(dateTimePointLt(vp1, vp2))) {
        t2 = {"right" : brand(["io.clause.latedeliveryandpenalty.Error"],{"message": "Cannot exercise late delivery before delivery date"})};
      } else {
        var t1;
        if (!((!(deref(unbrand(vlcontract), "forceMajeure")) || !(deref(unbrand(vrequest_0), "forceMajeure"))))) {
          t1 = {"left" : concat({"emit": vlemit}, concat({"state": vlstate}, {"response": brand(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"buyerMayTerminate": true}, {"penalty": 0.0}))}))};
        } else {
          var vp2 = vagreed;
          var vp1 = vnow;
          var vdiff = dateTimeDurationBetween(vp1, vp2);
          var vpenalty = ((((vdiff / deref(unbrand(deref(unbrand(vlcontract), "penaltyDuration")), "amount")) * deref(unbrand(vlcontract), "penaltyPercentage")) / 100.0) * deref(unbrand(vrequest_0), "goodsValue"));
          var vp1 = bunion([vpenalty], [((deref(unbrand(vlcontract), "capPercentage") * deref(unbrand(vrequest_0), "goodsValue")) / 100.0)]);
          var vcapped = Math.min.apply(Math,vp1);
          t1 = {"left" : concat({"emit": vlemit}, concat({"state": vlstate}, {"response": brand(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"buyerMayTerminate": !((compare(vdiff,deref(unbrand(deref(unbrand(vlcontract), "termination")), "amount")) <= 0))}, {"penalty": vcapped}))}))};
        }
        t2 = t1;
      }
      res3 = t2;
    } else {
      var vX$case0 = null;
      vX$case0 = toRight(cast(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"],vX$match0));
      res3 = {"right" : brand(["io.clause.latedeliveryandpenalty.Error"],{"message": ""})};
    }
    return res3;
  }
  latedeliveryandpenalty(context) {
    var vrequest = deref(context, "request");
    var vnow = deref(context, "now");
    var vemit = deref(context, "emit");
    var vstate = deref(context, "state");
    var vcontract = deref(context, "contract");
    var vlcontract = vcontract;
    var vlstate = vstate;
    var vlemit = vemit;
    var vagreed = deref(unbrand(vrequest), "agreedDelivery");
    var vp2 = vnow;
    var vp1 = vagreed;
    var t2;
    if (!(dateTimePointLt(vp1, vp2))) {
      t2 = {"right" : brand(["io.clause.latedeliveryandpenalty.Error"],{"message": "Cannot exercise late delivery before delivery date"})};
    } else {
      var t1;
      if (!((!(deref(unbrand(vlcontract), "forceMajeure")) || !(deref(unbrand(vrequest), "forceMajeure"))))) {
        t1 = {"left" : concat({"emit": vlemit}, concat({"state": vlstate}, {"response": brand(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"buyerMayTerminate": true}, {"penalty": 0.0}))}))};
      } else {
        var vp2 = vagreed;
        var vp1 = vnow;
        var vdiff = dateTimeDurationBetween(vp1, vp2);
        var vpenalty = ((((vdiff / deref(unbrand(deref(unbrand(vlcontract), "penaltyDuration")), "amount")) * deref(unbrand(vlcontract), "penaltyPercentage")) / 100.0) * deref(unbrand(vrequest), "goodsValue"));
        var vp1 = bunion([vpenalty], [((deref(unbrand(vlcontract), "capPercentage") * deref(unbrand(vrequest), "goodsValue")) / 100.0)]);
        var vcapped = Math.min.apply(Math,vp1);
        t1 = {"left" : concat({"emit": vlemit}, concat({"state": vlstate}, {"response": brand(["io.clause.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"buyerMayTerminate": !((compare(vdiff,deref(unbrand(deref(unbrand(vlcontract), "termination")), "amount")) <= 0))}, {"penalty": vcapped}))}))};
      }
      t2 = t1;
    }
    return t2;
  }
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/

