/* Generated using ergoc version 0.6.2 */
'use strict';
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/


/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.saft.Launch} context.request - the incoming request
 * @param {org.accordproject.saft.Payout} context.response - the response
 * @param {org.accordproject.base.Event} context.emit - the emitted events
 * @param {org.accordproject.cicero.contract.AccordContractState} context.state - the state
 */
function orgXaccordprojectXsaftXSaft_onLaunch(context) {
  let pcontext = { 'request' : context.request, 'state': context.state, 'contract': context.contract, 'emit': context.emit, 'now': context.now};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
  return new orgXaccordprojectXsaftXSaft().onLaunch(pcontext);
}

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.saft.Terminate} context.request - the incoming request
 * @param {org.accordproject.saft.Payout} context.response - the response
 * @param {org.accordproject.base.Event} context.emit - the emitted events
 * @param {org.accordproject.cicero.contract.AccordContractState} context.state - the state
 */
function orgXaccordprojectXsaftXSaft_onTerminate(context) {
  let pcontext = { 'request' : context.request, 'state': context.state, 'contract': context.contract, 'emit': context.emit, 'now': context.now};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
  return new orgXaccordprojectXsaftXSaft().onTerminate(pcontext);
}
class orgXaccordprojectXsaftXSaft {
  main(context) {
    var vcontract = deref(context, "contract");
    var vnow = deref(context, "now");
    var vrequest = deref(context, "request");
    var vemit = deref(context, "emit");
    var vstate = deref(context, "state");
    var vlstate_0 = vstate;
    var vlemit_0 = vemit;
    var vX$match0 = vrequest;
    var res1 = null;
    if (either(cast(["org.accordproject.saft.Terminate"],vX$match0))) {
      var vX$case0 = null;
      vX$case0 = toLeft(cast(["org.accordproject.saft.Terminate"],vX$match0));
      res1 = {"left" : {"$main": vX$case0}};
    } else {
      var vX$case1 = null;
      vX$case1 = toRight(cast(["org.accordproject.saft.Terminate"],vX$match0));
      res1 = {"right" : null};
    }
    var res4 = null;
    if (either(res1)) {
      var vX$case0_0 = null;
      vX$case0_0 = toLeft(res1);
      var vX$0 = vX$case0_0;
      var vX$main = deref(vX$0, "$main");
      var vnow_0 = vnow;
      var vcontract_0 = vcontract;
      var vstate_0 = vlstate_0;
      var vemit_0 = vlemit_0;
      var vrequest_0 = vX$main;
      var vlstate = vstate;
      var vlemit = vemit;
      res4 = {"left" : concat(concat({"response": brand(["org.accordproject.saft.Payout"],concat({"tokenAmount": brand(["org.accordproject.money.MonetaryAmount"],concat({"doubleValue": 9}, {"currencyCode": "USD"}))}, {"tokenAddress": deref(unbrand(vcontract), "purchaser")}))}, {"state": vlstate}), {"emit": vlemit})};
    } else {
      var vX$case1_0 = null;
      vX$case1_0 = toRight(res1);
      var res2 = null;
      if (either(cast(["org.accordproject.saft.Launch"],vX$match0))) {
        var vX$1 = null;
        vX$1 = toLeft(cast(["org.accordproject.saft.Launch"],vX$match0));
        res2 = {"left" : {"$main": vX$1}};
      } else {
        var vX$2 = null;
        vX$2 = toRight(cast(["org.accordproject.saft.Launch"],vX$match0));
        res2 = {"right" : null};
      }
      var res3 = null;
      if (either(res2)) {
        var vX$3 = null;
        vX$3 = toLeft(res2);
        var vX$4 = vX$3;
        var vX$5 = deref(vX$4, "$main");
        var vnow_0$0 = vnow;
        var vcontract_0$0 = vcontract;
        var vstate_0$0 = vlstate_0;
        var vemit_0$0 = vlemit_0;
        var vrequest_0$0 = vX$5;
        var vlstate$0 = vstate;
        var vlemit$0 = vemit;
        res3 = {"left" : concat(concat({"response": brand(["org.accordproject.saft.Payout"],concat({"tokenAmount": brand(["org.accordproject.money.MonetaryAmount"],concat({"doubleValue": 100}, {"currencyCode": "USD"}))}, {"tokenAddress": deref(unbrand(vcontract), "purchaser")}))}, {"state": vlstate$0}), {"emit": vlemit$0})};
      } else {
        var vX$6 = null;
        vX$6 = toRight(res2);
        res3 = {"right" : {"type": ["org.accordproject.ergo.stdlib.ErgoErrorResponse"], "data": {"message": "DefaultMatch Error at 19:0-33:1 ''"}}};
      }
      res4 = res3;
    }
    return res4;
  }
  init(context) {
    var vemit = deref(context, "emit");
    var vstate = deref(context, "state");
    var vlstate_0 = vstate;
    var vlemit = vemit;
    var vlstate = brand(["org.accordproject.cicero.contract.AccordContractState"],{"stateId": "org.accordproject.cicero.contract.AccordContractState#1"});
    return {"left" : concat(concat({"response": null}, {"state": vlstate}), {"emit": vlemit})};
  }
  onTerminate(context) {
    var vcontract = deref(context, "contract");
    var vemit = deref(context, "emit");
    var vstate = deref(context, "state");
    var vlstate = vstate;
    var vlemit = vemit;
    return {"left" : concat(concat({"response": brand(["org.accordproject.saft.Payout"],concat({"tokenAmount": brand(["org.accordproject.money.MonetaryAmount"],concat({"doubleValue": 9}, {"currencyCode": "USD"}))}, {"tokenAddress": deref(unbrand(vcontract), "purchaser")}))}, {"state": vlstate}), {"emit": vlemit})};
  }
  onLaunch(context) {
    var vcontract = deref(context, "contract");
    var vemit = deref(context, "emit");
    var vstate = deref(context, "state");
    var vlstate = vstate;
    var vlemit = vemit;
    return {"left" : concat(concat({"response": brand(["org.accordproject.saft.Payout"],concat({"tokenAmount": brand(["org.accordproject.money.MonetaryAmount"],concat({"doubleValue": 100}, {"currencyCode": "USD"}))}, {"tokenAddress": deref(unbrand(vcontract), "purchaser")}))}, {"state": vlstate}), {"emit": vlemit})};
  }
}
const contract = new orgXaccordprojectXsaftXSaft();
function __dispatch(context) {
  let pcontext = { 'request' : context.request, 'state': context.state, 'contract': context.contract, 'emit': context.emit, 'now': context.now};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
  return new orgXaccordprojectXsaftXSaft().main(pcontext);
}
function __init(context) {
  let pcontext = { 'request' : context.request, 'state': { '$class': 'org.accordproject.cicero.contract.AccordContractState', 'stateId' : 'org.accordproject.cicero.contract.AccordContractState#1' }, 'contract': context.contract, 'emit': context.emit, 'now': context.now};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
  return new orgXaccordprojectXsaftXSaft().init(pcontext);
}

/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/


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

/* Initialize inheritance */
var inheritance;

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
    if (t1 == "object" && v1 !== null) {
        if (v1.hasOwnProperty('nat')) { t1 = "number"; v1 = v1.nat; }
    };
    if (t2 == "object" && v2 !== null) {
        if (v2.hasOwnProperty('nat')) { t2 = "number"; v2 = v2.nat; }
    };
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
    if (moment.isMoment(v)) {
        return v.format();
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
    throw ("TypeError: unbrand called on non-object" + JSON.stringify(v));
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
    // Treat a missing field as a field containing null
    return null;
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
function natUnbox(v) {
    var t = typeof v;
    if (t == "number") { return Math.floor(v); }
    if (t == "object") { if (v !== null) if (v.hasOwnProperty('nat')) return Math.floor(v.nat) };
    return v;
}
function natPlus(v1, v2) {
    return natUnbox(v1) + natUnbox(v2);
}
function natMinus(v1, v2) {
    return natUnbox(v1) - natUnbox(v2);
}
function natMult(v1, v2) {
    return natUnbox(v1) * natUnbox(v2);
}
function natDiv(v1, v2) {
    return Math.floor(natUnbox(v1) / natUnbox(v2));
}
function natRem(v1, v2) {
    return Math.floor(natUnbox(v1) % natUnbox(v2));
}
function natMin(v1, v2) {
    return Math.min(natUnbox(v1),natUnbox(v2));
}
function natMax(v1, v2) {
    return Math.max(natUnbox(v1),natUnbox(v2));
}
function natAbs(v) {
    return Math.abs(natUnbox(v1),natUnbox(v2));
}
function natLog2(v) {
    return Math.floor(Math.log2(natUnbox(v))); // Default Z.log2 is log_inf, biggest integer lower than log2
}
function natSqrt(v) {
    return Math.floor(Math.sqrt(natUnbox(v))); // See Z.sqrt biggest integer lower than sqrt
}
function natSum(b) {
    var result = 0;
    for (var i=0; i<b.length; i++)
        result += natUnbox(b[i]);
    return result;
}
function natMinApply(b) {
    var numbers = [ ];
    for (var i=0; i<b.length; i++)
        numbers.push(natUnbox(b[i].nat));
    return Math.min.apply(Math,numbers);
}
function natMaxApply(b) {
    var numbers = [ ];
    for (var i=0; i<b.length; i++)
        numbers.push(natUnbox(b[i]));
    return Math.max.apply(Math,numbers);
}
function natArithMean(b) {
    var len = b.length;
    if(len == 0) {
        return 0;
    } else {
        return Math.floor(natSum(b)/len);
    }
}
function count(v) {
    return v.length;
}
function floatOfNat(v) {
    if(v.hasOwnProperty('nat')){
        return "" + v.nat;
    } else {
        return v;
    }
}
function substring(v, start, len) {
    return v.substring(start,len);
}
function substringNoLength(v, start) {
    return v.substring(start);
}

// Math operations
function acos(x) { return Math.acos(x); }
function asin(x) { return Math.asin(x); }
function atan(x) { return Math.atan(x); }
function atan2(y, x) { return Math.atan2(y, x); }
function cos(x) { return Math.cos(x); }
function cosh(x) { return Math.cosh(x); }
function sin(x) { return Math.sin(x); }
function sinh(x) { return Math.sinh(x); }
function tan(x) { return Math.tan(x); }
function tanh(x) { return Math.tanh(x); }
function constantPi() { return Math.PI; }
function constantE() { return Math.E; }

/* Addendum to for dateTime and duration */

var SECONDS = "second";
var MINUTES = "minute";
var HOURS = "hour";
var DAYS = "day";
var WEEKS = "week";
var MONTHS = "month";
var QUARTERS = "quarter";
var YEARS = "year";

function dateTimeComponent(part, date) {
    date = mustBeDate(date);
    switch(part) {
    case SECONDS:
        return date.second();
    case MINUTES:
        return date.minute();
    case HOURS:
        return date.hour();
    case DAYS:
        return date.date();
    case WEEKS:
        return date.week();
    case MONTHS:
        return date.month();
    case QUARTERS:
        return date.quarter();
    case YEARS:
        return date.year();
    default:
        throw new Error("Unknown DateTime component: " + part);
    }
}

function dateTimeFromString(stringDate) {
    return moment.parseZone(stringDate).utcOffset(utcOffset, false);
}

const minDateTime = moment.parseZone("0001-01-01 00:00:00").utcOffset(utcOffset, false);
const maxDateTime = moment.parseZone("3268-01-21 23:59:59").utcOffset(utcOffset, false);

function dateTimeMax(v) {
    var v1 = mustBeDateArray(v);
    if (v1.length === 0) {
        return minDateTime;
    } else {
        return moment.max(v1);
    }
}

function dateTimeMin(v) {
    var v1 = mustBeDateArray(v);
    if (v1.length === 0) {
        return maxDateTime;
    } else {
        return moment.min(v1);
    }
}

function dateTimeDurationAmount(v) {
    v = mustBeDuration(v);
    return v.asSeconds();
}

function dateTimeDurationFromString(stringDuration) {
    // TODO verify what the string format for durations is going to be.
    // Here we assume a number adjoined to a valid unit with a dash.
    if (typeof stringDuration === "string") {
	      var parts = stringDuration.split("-");
	      if (parts.length === 2) {
	          mustBeUnit(parts[1]);
            return moment.duration(parseFloat(parts[0]),parts[1]+"s");
        }
    }
    throw new Error("Not well formed duration input: " + stringDuration);
}

function dateTimePeriodFromString(stringDuration) {
    return dateTimeDurationFromString(stringDuration);
}

function dateTimeDurationFromNat(part, v) {
    mustBeUnit(part);
    let num;
    if (v.hasOwnProperty('nat')) { num = v.nat; } else { num = v; }
    // 'quarters' not built into durations
    if (part === QUARTERS) {
        return moment.duration(num * 3,'months');
    } else {
        return moment.duration(num,part);
    }
}

function dateTimePeriodFromNat(part, v) {
    return dateTimeDurationFromNat(part, v);
}

function dateTimeAdd(date, duration) {
    date = mustBeDate(date);
    duration = mustBeDuration(duration);
    return date.add(duration);
}

function dateTimeSubtract(date, d) {
    date = mustBeDate(date);
    d = mustBeDuration(d);
    return date.subtract(d);
}

function dateTimeAddPeriod(date, period) {
    date = mustBeDate(date);
    period = mustBeDuration(period);
    return date.add(period);
}

function dateTimeSubtractPeriod(date, period) {
    date = mustBeDate(date);
    period = mustBeDuration(period);
    return date.subtract(period);
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

function dateTimeIsSame(date1, date2) {
    return compareDates(date1, date2) === 0;
}

function dateTimeIsBefore(date1, date2) {
    return compareDates(date1,date2) < 0;
}

function dateTimeIsAfter(date1, date2) {
    return compareDates(date1, date2) > 0;
}

function dateTimeDiff(date1, date2) {
    date1 = mustBeDate(date1);
    date2 = mustBeDate(date2);
    return moment.duration(date1.diff(date2,'seconds'),'seconds');
}

function mustBeDate(date) {
    if (typeof date == "string") {
        return moment.parseZone(date).utcOffset(utcOffset, false);
    } else {
        return date.clone();
    }
}

function mustBeDateArray(dateArray) {
    var newDateArray = [];
    for (var i=0; i<dateArray.length; i++) {
        newDateArray.push(mustBeDate(dateArray[i]));
    }
    return newDateArray;
}

function mustBeDuration(d) {
    if (typeof d == "string") {
        return moment.duration(d);
    } else {
        return d.clone();
    }
}

function mustBeUnit(unit) {
    if (unit === SECONDS
        || unit === MINUTES
        || unit === HOURS
        || unit === DAYS
        || unit === WEEKS
        || unit === MONTHS
        || unit === QUARTERS
        || unit === YEARS)
	      return;
    throw new Error("Expected a duration unit but got " + JSON.stringify(unit));
}

function dateTimeStartOf(part, date) {
    date = mustBeDate(date);
    mustBeUnit(part);
    return date.startOf(part);
}

function dateTimeEndOf(part, date) {
    date = mustBeDate(date);
    mustBeUnit(part);
    return date.endOf(part);
}

/* Unwrapping errors on output */
function unwrapError(result) {
    if (result.hasOwnProperty('left')) {
        return toLeft(result);
    } else {
        var failure = toRight(result);
        var message = "Unknown Ergo Logic Error (Please file a GitHub issue)";
        if (either(cast(["org.accordproject.ergo.stdlib.ErgoErrorResponse"],failure))) {
            message = unbrand(toLeft(cast(["org.accordproject.ergo.stdlib.ErgoErrorResponse"],failure))).message;
        } else {
            message = JSON.stringify(toRight(cast(["org.accordproject.ergo.stdlib.ErgoErrorResponse"],failure)));
        }
        throw new Error("[Ergo] " + message);
    }
}

