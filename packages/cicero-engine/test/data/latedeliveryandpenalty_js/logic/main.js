
/* Generated using ergo version 0.21.9 */
'use strict';
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/

/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest} context.request - the incoming request
 * @param {org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse} context.response - the response
 * @param {concerto.Event} context.emit - the emitted events
 * @param {org.accordproject.runtime.State} context.state - the state
 */

function orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty_latedeliveryandpenalty(context) {
  let pcontext = Object.assign(context, { 'request' : context.request });
  return orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty.latedeliveryandpenalty(pcontext);
}
/* Generated using ergo version 0.21.9 */
'use strict';
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/
const inheritance=[ {
    "sub": ("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"), 
    "sup": ("org.accordproject.runtime.Response")
  }, {
    "sub": ("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"), 
    "sup": ("concerto.Transaction")
  }, {
    "sub": ("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"), 
    "sup": ("org.accordproject.runtime.Request")
  }, {
    "sub": ("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"), 
    "sup": ("concerto.Transaction")
  }, {
    "sub": ("org.accordproject.latedeliveryandpenalty.TemplateModel"), 
    "sup": ("org.accordproject.contract.Clause")
  }, {
    "sub": ("org.accordproject.latedeliveryandpenalty.TemplateModel"), 
    "sup": ("concerto.Asset")
  }, {
    "sub": ("org.accordproject.time.PeriodUnit"), 
    "sup": ("concerto.Enum")
  }, {
    "sub": ("org.accordproject.time.TemporalUnit"), 
    "sup": ("concerto.Enum")
  }, {
    "sub": ("org.accordproject.time.Day"), 
    "sup": ("concerto.Enum")
  }, {
    "sub": ("org.accordproject.time.Month"), 
    "sup": ("concerto.Enum")
  }, {
    "sub": ("org.accordproject.ergo.stdlib.Error"), 
    "sup": ("org.accordproject.runtime.ErrorResponse")
  }, {
    "sub": ("org.accordproject.runtime.State"), 
    "sup": ("concerto.Asset")
  }, {
    "sub": ("org.accordproject.runtime.Obligation"), 
    "sup": ("concerto.Event")
  }, {
    "sub": ("org.accordproject.runtime.Response"), 
    "sup": ("concerto.Transaction")
  }, {
    "sub": ("org.accordproject.runtime.Request"), 
    "sup": ("concerto.Transaction")
  }, {
    "sub": ("org.accordproject.money.CurrencyCode"), 
    "sup": ("concerto.Enum")
  }, {
    "sub": ("org.accordproject.money.DigitalCurrencyCode"), 
    "sup": ("concerto.Enum")
  }, {
    "sub": ("org.accordproject.contract.Clause"), 
    "sup": ("concerto.Asset")
  }, {
    "sub": ("org.accordproject.contract.Contract"), 
    "sup": ("concerto.Asset")
  }, {
    "sub": ("org.accordproject.party.Party"), 
    "sup": ("concerto.Participant")
  } ]
class orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty{
  static main(constants0) {
    {
      let ret0;
      {
        let __lstate;
        {
          ;
          __lstate = recDot(constants0, "__state");;
          {
            let __lemit;
            {
              ;
              __lemit = recDot(constants0, "__emit");;
              {
                let __this;
                {
                  ;
                  __this = recDot(constants0, "__contract");;
                  {
                    let $match0;
                    {
                      ;
                      $match0 = recDot(constants0, "request");;
                      {
                        let stratify0;
                        {
                          ;
                          if (either(cast(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"), $match0))) {
                            {
                              let $case0 = toLeft(cast(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"), $match0));
                              stratify0 = {
                                  "$left": ({
                                    "$$main": ($case0)
                                  })
                                };
                            }
                          } else {
                            {
                              let $case1 = toRight(cast(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"), $match0));
                              stratify0 = {
                                  "$right": (null)
                                };
                            }
                          };
                          if (either(stratify0)) {
                            {
                              let $case0 = toLeft(stratify0);
                              {
                                let $4;
                                {
                                  ;
                                  $4 = $case0;;
                                  {
                                    let $main;
                                    {
                                      ;
                                      $main = recDot($4, "$$main");;
                                      {
                                        let __contract;
                                        {
                                          ;
                                          __contract = recDot(constants0, "__contract");;
                                          {
                                            let __state;
                                            {
                                              ;
                                              __state = __lstate;;
                                              {
                                                let __emit;
                                                {
                                                  ;
                                                  __emit = __lemit;;
                                                  {
                                                    let request;
                                                    {
                                                      ;
                                                      request = $main;;
                                                      {
                                                        let __lstate$0;
                                                        {
                                                          ;
                                                          __lstate$0 = recDot(constants0, "__state");;
                                                          {
                                                            let __lemit$0;
                                                            {
                                                              ;
                                                              __lemit$0 = recDot(constants0, "__emit");;
                                                              {
                                                                let __this$0;
                                                                {
                                                                  ;
                                                                  __this$0 = recDot(constants0, "__contract");;
                                                                  {
                                                                    let agreed;
                                                                    {
                                                                      ;
                                                                      agreed = recDot(unbrand(recDot(constants0, "request")), "agreedDelivery");;
                                                                      {
                                                                        let stratify0$A;
                                                                        {
                                                                          ;
                                                                          {
                                                                            let p1;
                                                                            {
                                                                              ;
                                                                              p1 = agreed;;
                                                                              {
                                                                                let p2;
                                                                                {
                                                                                  ;
                                                                                  p2 = recDot(constants0, "__now");;
                                                                                  stratify0$A = dateTimeIsBefore(p1, p2);
                                                                                }
                                                                              }
                                                                            }
                                                                          };
                                                                          if ((!stratify0$A)) {
                                                                            ret0 = {
                                                                                "$right": (brand(array("org.accordproject.ergo.stdlib.Error"), {
                                                                                    "message": ("Cannot exercise late delivery before delivery date")
                                                                                  }))
                                                                              };
                                                                          } else {
                                                                            if ((!((!recDot(unbrand(recDot(constants0, "__contract")), "forceMajeure")) || (!recDot(unbrand(recDot(constants0, "request")), "forceMajeure"))))) {
                                                                              ret0 = {
                                                                                  "$left": (recConcat(recConcat({
                                                                                        "__response": (brand(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"), recConcat({
                                                                                              "penalty": (0.0)
                                                                                            }, {
                                                                                              "buyerMayTerminate": (true)
                                                                                            })))
                                                                                      }, {
                                                                                        "__state": (__lstate$0)
                                                                                      }), {
                                                                                      "__emit": (__lemit$0)
                                                                                    }))
                                                                                };
                                                                            } else {
                                                                              {
                                                                                let diff;
                                                                                {
                                                                                  ;
                                                                                  {
                                                                                    let stratify0$9;
                                                                                    {
                                                                                      ;
                                                                                      {
                                                                                        let x;
                                                                                        {
                                                                                          ;
                                                                                          x = recDot(constants0, "__now");;
                                                                                          {
                                                                                            let y;
                                                                                            {
                                                                                              ;
                                                                                              y = agreed;;
                                                                                              {
                                                                                                let z;
                                                                                                {
                                                                                                  ;
                                                                                                  z = {
                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                      "$data": ({
                                                                                                        "$right": ({
                                                                                                          "$right": ({
                                                                                                            "$right": ({
                                                                                                              "$left": ("days")
                                                                                                            })
                                                                                                          })
                                                                                                        })
                                                                                                      })
                                                                                                    };;
                                                                                                  {
                                                                                                    let du;
                                                                                                    {
                                                                                                      ;
                                                                                                      {
                                                                                                        let du$0;
                                                                                                        {
                                                                                                          ;
                                                                                                          {
                                                                                                            let p1;
                                                                                                            {
                                                                                                              ;
                                                                                                              p1 = x;;
                                                                                                              {
                                                                                                                let p2;
                                                                                                                {
                                                                                                                  ;
                                                                                                                  p2 = y;;
                                                                                                                  du$0 = dateTimeDiff(p1, p2);
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          };
                                                                                                          {
                                                                                                            let stratify0$0;
                                                                                                            {
                                                                                                              ;
                                                                                                              {
                                                                                                                let p0;
                                                                                                                {
                                                                                                                  ;
                                                                                                                  p0 = du$0;;
                                                                                                                  stratify0$0 = dateTimeDurationAmount(p0);
                                                                                                                }
                                                                                                              };
                                                                                                              du = brand(array("org.accordproject.time.Duration"), recConcat({
                                                                                                                      "unit": ({
                                                                                                                        "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                        "$data": ({
                                                                                                                          "$left": ("seconds")
                                                                                                                        })
                                                                                                                      })
                                                                                                                    }, {
                                                                                                                      "amount": (stratify0$0)
                                                                                                                    }));
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      };
                                                                                                      {
                                                                                                        let u;
                                                                                                        {
                                                                                                          ;
                                                                                                          u = z;;
                                                                                                          if (equal(u, recDot(unbrand(du), "unit"))) {
                                                                                                            stratify0$9 = du;
                                                                                                          } else {
                                                                                                            {
                                                                                                              let amount;
                                                                                                              {
                                                                                                                ;
                                                                                                                {
                                                                                                                  let $3;
                                                                                                                  {
                                                                                                                    ;
                                                                                                                    $3 = u;;
                                                                                                                    {
                                                                                                                      let stratify0$8;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        if (equal($3, {
                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                              "$data": ({
                                                                                                                                "$left": ("seconds")
                                                                                                                              })
                                                                                                                            })) {
                                                                                                                          stratify0$8 = {
                                                                                                                              "$left": ({
                                                                                                                              })
                                                                                                                            };
                                                                                                                        } else {
                                                                                                                          stratify0$8 = {
                                                                                                                              "$right": (null)
                                                                                                                            };
                                                                                                                        };
                                                                                                                        if (either(stratify0$8)) {
                                                                                                                          {
                                                                                                                            let $case0 = toLeft(stratify0$8);
                                                                                                                            {
                                                                                                                              let $2;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                $2 = $case0;;
                                                                                                                                {
                                                                                                                                  let $1;
                                                                                                                                  {
                                                                                                                                    ;
                                                                                                                                    $1 = recDot(unbrand(du), "unit");;
                                                                                                                                    {
                                                                                                                                      let stratify0$3;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        if (equal($1, {
                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                              "$data": ({
                                                                                                                                                "$right": ({
                                                                                                                                                  "$left": ("minutes")
                                                                                                                                                })
                                                                                                                                              })
                                                                                                                                            })) {
                                                                                                                                          stratify0$3 = {
                                                                                                                                              "$left": ({
                                                                                                                                              })
                                                                                                                                            };
                                                                                                                                        } else {
                                                                                                                                          stratify0$3 = {
                                                                                                                                              "$right": (null)
                                                                                                                                            };
                                                                                                                                        };
                                                                                                                                        if (either(stratify0$3)) {
                                                                                                                                          {
                                                                                                                                            let $case0 = toLeft(stratify0$3);
                                                                                                                                            {
                                                                                                                                              let $0;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                $0 = $case0;;
                                                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                    });
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        } else {
                                                                                                                                          {
                                                                                                                                            let $case1 = toRight(stratify0$3);
                                                                                                                                            {
                                                                                                                                              let stratify0$2;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                if (equal($1, {
                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                      "$data": ({
                                                                                                                                                        "$right": ({
                                                                                                                                                          "$right": ({
                                                                                                                                                            "$left": ("hours")
                                                                                                                                                          })
                                                                                                                                                        })
                                                                                                                                                      })
                                                                                                                                                    })) {
                                                                                                                                                  stratify0$2 = {
                                                                                                                                                      "$left": ({
                                                                                                                                                      })
                                                                                                                                                    };
                                                                                                                                                } else {
                                                                                                                                                  stratify0$2 = {
                                                                                                                                                      "$right": (null)
                                                                                                                                                    };
                                                                                                                                                };
                                                                                                                                                if (either(stratify0$2)) {
                                                                                                                                                  {
                                                                                                                                                    let $case0 = toLeft(stratify0$2);
                                                                                                                                                    {
                                                                                                                                                      let $0;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        $0 = $case0;;
                                                                                                                                                        amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                              }), {
                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                            });
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                } else {
                                                                                                                                                  {
                                                                                                                                                    let $case1 = toRight(stratify0$2);
                                                                                                                                                    {
                                                                                                                                                      let stratify0$1;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        if (equal($1, {
                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                              "$data": ({
                                                                                                                                                                "$right": ({
                                                                                                                                                                  "$right": ({
                                                                                                                                                                    "$right": ({
                                                                                                                                                                      "$left": ("days")
                                                                                                                                                                    })
                                                                                                                                                                  })
                                                                                                                                                                })
                                                                                                                                                              })
                                                                                                                                                            })) {
                                                                                                                                                          stratify0$1 = {
                                                                                                                                                              "$left": ({
                                                                                                                                                              })
                                                                                                                                                            };
                                                                                                                                                        } else {
                                                                                                                                                          stratify0$1 = {
                                                                                                                                                              "$right": (null)
                                                                                                                                                            };
                                                                                                                                                        };
                                                                                                                                                        if (either(stratify0$1)) {
                                                                                                                                                          {
                                                                                                                                                            let $case0 = toLeft(stratify0$1);
                                                                                                                                                            {
                                                                                                                                                              let $0;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                amount = natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                          "$nat": (60.0)
                                                                                                                                                                        }), {
                                                                                                                                                                        "$nat": (60.0)
                                                                                                                                                                      }), {
                                                                                                                                                                      "$nat": (24.0)
                                                                                                                                                                    });
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        } else {
                                                                                                                                                          {
                                                                                                                                                            let $case1 = toRight(stratify0$1);
                                                                                                                                                            {
                                                                                                                                                              let stratify0$0;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                if (equal($1, {
                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                      "$data": ({
                                                                                                                                                                        "$right": ({
                                                                                                                                                                          "$right": ({
                                                                                                                                                                            "$right": ({
                                                                                                                                                                              "$right": ({
                                                                                                                                                                                "$left": ("weeks")
                                                                                                                                                                              })
                                                                                                                                                                            })
                                                                                                                                                                          })
                                                                                                                                                                        })
                                                                                                                                                                      })
                                                                                                                                                                    })) {
                                                                                                                                                                  stratify0$0 = {
                                                                                                                                                                      "$left": ({
                                                                                                                                                                      })
                                                                                                                                                                    };
                                                                                                                                                                } else {
                                                                                                                                                                  stratify0$0 = {
                                                                                                                                                                      "$right": (null)
                                                                                                                                                                    };
                                                                                                                                                                };
                                                                                                                                                                if (either(stratify0$0)) {
                                                                                                                                                                  {
                                                                                                                                                                    let $case0 = toLeft(stratify0$0);
                                                                                                                                                                    {
                                                                                                                                                                      let $0;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                        amount = natMult(natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                    "$nat": (60.0)
                                                                                                                                                                                  }), {
                                                                                                                                                                                  "$nat": (60.0)
                                                                                                                                                                                }), {
                                                                                                                                                                                "$nat": (24.0)
                                                                                                                                                                              }), {
                                                                                                                                                                              "$nat": (7.0)
                                                                                                                                                                            });
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                } else {
                                                                                                                                                                  {
                                                                                                                                                                    let $case1 = toRight(stratify0$0);
                                                                                                                                                                    amount = recDot(unbrand(du), "amount");
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        } else {
                                                                                                                          {
                                                                                                                            let $case1 = toRight(stratify0$8);
                                                                                                                            {
                                                                                                                              let stratify0$7;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                if (equal($3, {
                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                      "$data": ({
                                                                                                                                        "$right": ({
                                                                                                                                          "$left": ("minutes")
                                                                                                                                        })
                                                                                                                                      })
                                                                                                                                    })) {
                                                                                                                                  stratify0$7 = {
                                                                                                                                      "$left": ({
                                                                                                                                      })
                                                                                                                                    };
                                                                                                                                } else {
                                                                                                                                  stratify0$7 = {
                                                                                                                                      "$right": (null)
                                                                                                                                    };
                                                                                                                                };
                                                                                                                                if (either(stratify0$7)) {
                                                                                                                                  {
                                                                                                                                    let $case0 = toLeft(stratify0$7);
                                                                                                                                    {
                                                                                                                                      let $2;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        $2 = $case0;;
                                                                                                                                        {
                                                                                                                                          let $1;
                                                                                                                                          {
                                                                                                                                            ;
                                                                                                                                            $1 = recDot(unbrand(du), "unit");;
                                                                                                                                            {
                                                                                                                                              let stratify0$3;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                if (equal($1, {
                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                      "$data": ({
                                                                                                                                                        "$left": ("seconds")
                                                                                                                                                      })
                                                                                                                                                    })) {
                                                                                                                                                  stratify0$3 = {
                                                                                                                                                      "$left": ({
                                                                                                                                                      })
                                                                                                                                                    };
                                                                                                                                                } else {
                                                                                                                                                  stratify0$3 = {
                                                                                                                                                      "$right": (null)
                                                                                                                                                    };
                                                                                                                                                };
                                                                                                                                                if (either(stratify0$3)) {
                                                                                                                                                  {
                                                                                                                                                    let $case0 = toLeft(stratify0$3);
                                                                                                                                                    {
                                                                                                                                                      let $0;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        $0 = $case0;;
                                                                                                                                                        amount = natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                            });
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                } else {
                                                                                                                                                  {
                                                                                                                                                    let $case1 = toRight(stratify0$3);
                                                                                                                                                    {
                                                                                                                                                      let stratify0$2;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        if (equal($1, {
                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                              "$data": ({
                                                                                                                                                                "$right": ({
                                                                                                                                                                  "$right": ({
                                                                                                                                                                    "$left": ("hours")
                                                                                                                                                                  })
                                                                                                                                                                })
                                                                                                                                                              })
                                                                                                                                                            })) {
                                                                                                                                                          stratify0$2 = {
                                                                                                                                                              "$left": ({
                                                                                                                                                              })
                                                                                                                                                            };
                                                                                                                                                        } else {
                                                                                                                                                          stratify0$2 = {
                                                                                                                                                              "$right": (null)
                                                                                                                                                            };
                                                                                                                                                        };
                                                                                                                                                        if (either(stratify0$2)) {
                                                                                                                                                          {
                                                                                                                                                            let $case0 = toLeft(stratify0$2);
                                                                                                                                                            {
                                                                                                                                                              let $0;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                                    });
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        } else {
                                                                                                                                                          {
                                                                                                                                                            let $case1 = toRight(stratify0$2);
                                                                                                                                                            {
                                                                                                                                                              let stratify0$1;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                if (equal($1, {
                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                      "$data": ({
                                                                                                                                                                        "$right": ({
                                                                                                                                                                          "$right": ({
                                                                                                                                                                            "$right": ({
                                                                                                                                                                              "$left": ("days")
                                                                                                                                                                            })
                                                                                                                                                                          })
                                                                                                                                                                        })
                                                                                                                                                                      })
                                                                                                                                                                    })) {
                                                                                                                                                                  stratify0$1 = {
                                                                                                                                                                      "$left": ({
                                                                                                                                                                      })
                                                                                                                                                                    };
                                                                                                                                                                } else {
                                                                                                                                                                  stratify0$1 = {
                                                                                                                                                                      "$right": (null)
                                                                                                                                                                    };
                                                                                                                                                                };
                                                                                                                                                                if (either(stratify0$1)) {
                                                                                                                                                                  {
                                                                                                                                                                    let $case0 = toLeft(stratify0$1);
                                                                                                                                                                    {
                                                                                                                                                                      let $0;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                        amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                                              }), {
                                                                                                                                                                              "$nat": (24.0)
                                                                                                                                                                            });
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                } else {
                                                                                                                                                                  {
                                                                                                                                                                    let $case1 = toRight(stratify0$1);
                                                                                                                                                                    {
                                                                                                                                                                      let stratify0$0;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        if (equal($1, {
                                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                              "$data": ({
                                                                                                                                                                                "$right": ({
                                                                                                                                                                                  "$right": ({
                                                                                                                                                                                    "$right": ({
                                                                                                                                                                                      "$right": ({
                                                                                                                                                                                        "$left": ("weeks")
                                                                                                                                                                                      })
                                                                                                                                                                                    })
                                                                                                                                                                                  })
                                                                                                                                                                                })
                                                                                                                                                                              })
                                                                                                                                                                            })) {
                                                                                                                                                                          stratify0$0 = {
                                                                                                                                                                              "$left": ({
                                                                                                                                                                              })
                                                                                                                                                                            };
                                                                                                                                                                        } else {
                                                                                                                                                                          stratify0$0 = {
                                                                                                                                                                              "$right": (null)
                                                                                                                                                                            };
                                                                                                                                                                        };
                                                                                                                                                                        if (either(stratify0$0)) {
                                                                                                                                                                          {
                                                                                                                                                                            let $case0 = toLeft(stratify0$0);
                                                                                                                                                                            {
                                                                                                                                                                              let $0;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                                amount = natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                          "$nat": (60.0)
                                                                                                                                                                                        }), {
                                                                                                                                                                                        "$nat": (24.0)
                                                                                                                                                                                      }), {
                                                                                                                                                                                      "$nat": (7.0)
                                                                                                                                                                                    });
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        } else {
                                                                                                                                                                          {
                                                                                                                                                                            let $case1 = toRight(stratify0$0);
                                                                                                                                                                            amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                  "$nat": (60.0)
                                                                                                                                                                                });
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                } else {
                                                                                                                                  {
                                                                                                                                    let $case1 = toRight(stratify0$7);
                                                                                                                                    {
                                                                                                                                      let stratify0$6;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        if (equal($3, {
                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                              "$data": ({
                                                                                                                                                "$right": ({
                                                                                                                                                  "$right": ({
                                                                                                                                                    "$left": ("hours")
                                                                                                                                                  })
                                                                                                                                                })
                                                                                                                                              })
                                                                                                                                            })) {
                                                                                                                                          stratify0$6 = {
                                                                                                                                              "$left": ({
                                                                                                                                              })
                                                                                                                                            };
                                                                                                                                        } else {
                                                                                                                                          stratify0$6 = {
                                                                                                                                              "$right": (null)
                                                                                                                                            };
                                                                                                                                        };
                                                                                                                                        if (either(stratify0$6)) {
                                                                                                                                          {
                                                                                                                                            let $case0 = toLeft(stratify0$6);
                                                                                                                                            {
                                                                                                                                              let $2;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                $2 = $case0;;
                                                                                                                                                {
                                                                                                                                                  let $1;
                                                                                                                                                  {
                                                                                                                                                    ;
                                                                                                                                                    $1 = recDot(unbrand(du), "unit");;
                                                                                                                                                    {
                                                                                                                                                      let stratify0$3;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        if (equal($1, {
                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                              "$data": ({
                                                                                                                                                                "$left": ("seconds")
                                                                                                                                                              })
                                                                                                                                                            })) {
                                                                                                                                                          stratify0$3 = {
                                                                                                                                                              "$left": ({
                                                                                                                                                              })
                                                                                                                                                            };
                                                                                                                                                        } else {
                                                                                                                                                          stratify0$3 = {
                                                                                                                                                              "$right": (null)
                                                                                                                                                            };
                                                                                                                                                        };
                                                                                                                                                        if (either(stratify0$3)) {
                                                                                                                                                          {
                                                                                                                                                            let $case0 = toLeft(stratify0$3);
                                                                                                                                                            {
                                                                                                                                                              let $0;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                amount = natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                        "$nat": (60.0)
                                                                                                                                                                      }), {
                                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                                    });
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        } else {
                                                                                                                                                          {
                                                                                                                                                            let $case1 = toRight(stratify0$3);
                                                                                                                                                            {
                                                                                                                                                              let stratify0$2;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                if (equal($1, {
                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                      "$data": ({
                                                                                                                                                                        "$right": ({
                                                                                                                                                                          "$left": ("minutes")
                                                                                                                                                                        })
                                                                                                                                                                      })
                                                                                                                                                                    })) {
                                                                                                                                                                  stratify0$2 = {
                                                                                                                                                                      "$left": ({
                                                                                                                                                                      })
                                                                                                                                                                    };
                                                                                                                                                                } else {
                                                                                                                                                                  stratify0$2 = {
                                                                                                                                                                      "$right": (null)
                                                                                                                                                                    };
                                                                                                                                                                };
                                                                                                                                                                if (either(stratify0$2)) {
                                                                                                                                                                  {
                                                                                                                                                                    let $case0 = toLeft(stratify0$2);
                                                                                                                                                                    {
                                                                                                                                                                      let $0;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                        amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                                            });
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                } else {
                                                                                                                                                                  {
                                                                                                                                                                    let $case1 = toRight(stratify0$2);
                                                                                                                                                                    {
                                                                                                                                                                      let stratify0$1;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        if (equal($1, {
                                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                              "$data": ({
                                                                                                                                                                                "$right": ({
                                                                                                                                                                                  "$right": ({
                                                                                                                                                                                    "$right": ({
                                                                                                                                                                                      "$left": ("days")
                                                                                                                                                                                    })
                                                                                                                                                                                  })
                                                                                                                                                                                })
                                                                                                                                                                              })
                                                                                                                                                                            })) {
                                                                                                                                                                          stratify0$1 = {
                                                                                                                                                                              "$left": ({
                                                                                                                                                                              })
                                                                                                                                                                            };
                                                                                                                                                                        } else {
                                                                                                                                                                          stratify0$1 = {
                                                                                                                                                                              "$right": (null)
                                                                                                                                                                            };
                                                                                                                                                                        };
                                                                                                                                                                        if (either(stratify0$1)) {
                                                                                                                                                                          {
                                                                                                                                                                            let $case0 = toLeft(stratify0$1);
                                                                                                                                                                            {
                                                                                                                                                                              let $0;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                      "$nat": (24.0)
                                                                                                                                                                                    });
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        } else {
                                                                                                                                                                          {
                                                                                                                                                                            let $case1 = toRight(stratify0$1);
                                                                                                                                                                            {
                                                                                                                                                                              let stratify0$0;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                if (equal($1, {
                                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                      "$data": ({
                                                                                                                                                                                        "$right": ({
                                                                                                                                                                                          "$right": ({
                                                                                                                                                                                            "$right": ({
                                                                                                                                                                                              "$right": ({
                                                                                                                                                                                                "$left": ("weeks")
                                                                                                                                                                                              })
                                                                                                                                                                                            })
                                                                                                                                                                                          })
                                                                                                                                                                                        })
                                                                                                                                                                                      })
                                                                                                                                                                                    })) {
                                                                                                                                                                                  stratify0$0 = {
                                                                                                                                                                                      "$left": ({
                                                                                                                                                                                      })
                                                                                                                                                                                    };
                                                                                                                                                                                } else {
                                                                                                                                                                                  stratify0$0 = {
                                                                                                                                                                                      "$right": (null)
                                                                                                                                                                                    };
                                                                                                                                                                                };
                                                                                                                                                                                if (either(stratify0$0)) {
                                                                                                                                                                                  {
                                                                                                                                                                                    let $case0 = toLeft(stratify0$0);
                                                                                                                                                                                    {
                                                                                                                                                                                      let $0;
                                                                                                                                                                                      {
                                                                                                                                                                                        ;
                                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                                        amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                "$nat": (24.0)
                                                                                                                                                                                              }), {
                                                                                                                                                                                              "$nat": (7.0)
                                                                                                                                                                                            });
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                } else {
                                                                                                                                                                                  {
                                                                                                                                                                                    let $case1 = toRight(stratify0$0);
                                                                                                                                                                                    amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                            "$nat": (60.0)
                                                                                                                                                                                          }), {
                                                                                                                                                                                          "$nat": (60.0)
                                                                                                                                                                                        });
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        } else {
                                                                                                                                          {
                                                                                                                                            let $case1 = toRight(stratify0$6);
                                                                                                                                            {
                                                                                                                                              let stratify0$5;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                if (equal($3, {
                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                      "$data": ({
                                                                                                                                                        "$right": ({
                                                                                                                                                          "$right": ({
                                                                                                                                                            "$right": ({
                                                                                                                                                              "$left": ("days")
                                                                                                                                                            })
                                                                                                                                                          })
                                                                                                                                                        })
                                                                                                                                                      })
                                                                                                                                                    })) {
                                                                                                                                                  stratify0$5 = {
                                                                                                                                                      "$left": ({
                                                                                                                                                      })
                                                                                                                                                    };
                                                                                                                                                } else {
                                                                                                                                                  stratify0$5 = {
                                                                                                                                                      "$right": (null)
                                                                                                                                                    };
                                                                                                                                                };
                                                                                                                                                if (either(stratify0$5)) {
                                                                                                                                                  {
                                                                                                                                                    let $case0 = toLeft(stratify0$5);
                                                                                                                                                    {
                                                                                                                                                      let $2;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        $2 = $case0;;
                                                                                                                                                        {
                                                                                                                                                          let $1;
                                                                                                                                                          {
                                                                                                                                                            ;
                                                                                                                                                            $1 = recDot(unbrand(du), "unit");;
                                                                                                                                                            {
                                                                                                                                                              let stratify0$3;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                if (equal($1, {
                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                      "$data": ({
                                                                                                                                                                        "$left": ("seconds")
                                                                                                                                                                      })
                                                                                                                                                                    })) {
                                                                                                                                                                  stratify0$3 = {
                                                                                                                                                                      "$left": ({
                                                                                                                                                                      })
                                                                                                                                                                    };
                                                                                                                                                                } else {
                                                                                                                                                                  stratify0$3 = {
                                                                                                                                                                      "$right": (null)
                                                                                                                                                                    };
                                                                                                                                                                };
                                                                                                                                                                if (either(stratify0$3)) {
                                                                                                                                                                  {
                                                                                                                                                                    let $case0 = toLeft(stratify0$3);
                                                                                                                                                                    {
                                                                                                                                                                      let $0;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                        amount = natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                  "$nat": (60.0)
                                                                                                                                                                                }), {
                                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                                              }), {
                                                                                                                                                                              "$nat": (24.0)
                                                                                                                                                                            });
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                } else {
                                                                                                                                                                  {
                                                                                                                                                                    let $case1 = toRight(stratify0$3);
                                                                                                                                                                    {
                                                                                                                                                                      let stratify0$2;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        if (equal($1, {
                                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                              "$data": ({
                                                                                                                                                                                "$right": ({
                                                                                                                                                                                  "$left": ("minutes")
                                                                                                                                                                                })
                                                                                                                                                                              })
                                                                                                                                                                            })) {
                                                                                                                                                                          stratify0$2 = {
                                                                                                                                                                              "$left": ({
                                                                                                                                                                              })
                                                                                                                                                                            };
                                                                                                                                                                        } else {
                                                                                                                                                                          stratify0$2 = {
                                                                                                                                                                              "$right": (null)
                                                                                                                                                                            };
                                                                                                                                                                        };
                                                                                                                                                                        if (either(stratify0$2)) {
                                                                                                                                                                          {
                                                                                                                                                                            let $case0 = toLeft(stratify0$2);
                                                                                                                                                                            {
                                                                                                                                                                              let $0;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                                amount = natDiv(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                        "$nat": (60.0)
                                                                                                                                                                                      }), {
                                                                                                                                                                                      "$nat": (24.0)
                                                                                                                                                                                    });
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        } else {
                                                                                                                                                                          {
                                                                                                                                                                            let $case1 = toRight(stratify0$2);
                                                                                                                                                                            {
                                                                                                                                                                              let stratify0$1;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                if (equal($1, {
                                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                      "$data": ({
                                                                                                                                                                                        "$right": ({
                                                                                                                                                                                          "$right": ({
                                                                                                                                                                                            "$left": ("hours")
                                                                                                                                                                                          })
                                                                                                                                                                                        })
                                                                                                                                                                                      })
                                                                                                                                                                                    })) {
                                                                                                                                                                                  stratify0$1 = {
                                                                                                                                                                                      "$left": ({
                                                                                                                                                                                      })
                                                                                                                                                                                    };
                                                                                                                                                                                } else {
                                                                                                                                                                                  stratify0$1 = {
                                                                                                                                                                                      "$right": (null)
                                                                                                                                                                                    };
                                                                                                                                                                                };
                                                                                                                                                                                if (either(stratify0$1)) {
                                                                                                                                                                                  {
                                                                                                                                                                                    let $case0 = toLeft(stratify0$1);
                                                                                                                                                                                    {
                                                                                                                                                                                      let $0;
                                                                                                                                                                                      {
                                                                                                                                                                                        ;
                                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                                        amount = natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                              "$nat": (24.0)
                                                                                                                                                                                            });
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                } else {
                                                                                                                                                                                  {
                                                                                                                                                                                    let $case1 = toRight(stratify0$1);
                                                                                                                                                                                    {
                                                                                                                                                                                      let stratify0$0;
                                                                                                                                                                                      {
                                                                                                                                                                                        ;
                                                                                                                                                                                        if (equal($1, {
                                                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                              "$data": ({
                                                                                                                                                                                                "$right": ({
                                                                                                                                                                                                  "$right": ({
                                                                                                                                                                                                    "$right": ({
                                                                                                                                                                                                      "$right": ({
                                                                                                                                                                                                        "$left": ("weeks")
                                                                                                                                                                                                      })
                                                                                                                                                                                                    })
                                                                                                                                                                                                  })
                                                                                                                                                                                                })
                                                                                                                                                                                              })
                                                                                                                                                                                            })) {
                                                                                                                                                                                          stratify0$0 = {
                                                                                                                                                                                              "$left": ({
                                                                                                                                                                                              })
                                                                                                                                                                                            };
                                                                                                                                                                                        } else {
                                                                                                                                                                                          stratify0$0 = {
                                                                                                                                                                                              "$right": (null)
                                                                                                                                                                                            };
                                                                                                                                                                                        };
                                                                                                                                                                                        if (either(stratify0$0)) {
                                                                                                                                                                                          {
                                                                                                                                                                                            let $case0 = toLeft(stratify0$0);
                                                                                                                                                                                            {
                                                                                                                                                                                              let $0;
                                                                                                                                                                                              {
                                                                                                                                                                                                ;
                                                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                      "$nat": (7.0)
                                                                                                                                                                                                    });
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        } else {
                                                                                                                                                                                          {
                                                                                                                                                                                            let $case1 = toRight(stratify0$0);
                                                                                                                                                                                            amount = natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                                                                    }), {
                                                                                                                                                                                                    "$nat": (60.0)
                                                                                                                                                                                                  }), {
                                                                                                                                                                                                  "$nat": (24.0)
                                                                                                                                                                                                });
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                } else {
                                                                                                                                                  {
                                                                                                                                                    let $case1 = toRight(stratify0$5);
                                                                                                                                                    {
                                                                                                                                                      let stratify0$4;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        if (equal($3, {
                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                              "$data": ({
                                                                                                                                                                "$right": ({
                                                                                                                                                                  "$right": ({
                                                                                                                                                                    "$right": ({
                                                                                                                                                                      "$right": ({
                                                                                                                                                                        "$left": ("weeks")
                                                                                                                                                                      })
                                                                                                                                                                    })
                                                                                                                                                                  })
                                                                                                                                                                })
                                                                                                                                                              })
                                                                                                                                                            })) {
                                                                                                                                                          stratify0$4 = {
                                                                                                                                                              "$left": ({
                                                                                                                                                              })
                                                                                                                                                            };
                                                                                                                                                        } else {
                                                                                                                                                          stratify0$4 = {
                                                                                                                                                              "$right": (null)
                                                                                                                                                            };
                                                                                                                                                        };
                                                                                                                                                        if (either(stratify0$4)) {
                                                                                                                                                          {
                                                                                                                                                            let $case0 = toLeft(stratify0$4);
                                                                                                                                                            {
                                                                                                                                                              let $2;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                $2 = $case0;;
                                                                                                                                                                {
                                                                                                                                                                  let $1;
                                                                                                                                                                  {
                                                                                                                                                                    ;
                                                                                                                                                                    $1 = recDot(unbrand(du), "unit");;
                                                                                                                                                                    {
                                                                                                                                                                      let stratify0$3;
                                                                                                                                                                      {
                                                                                                                                                                        ;
                                                                                                                                                                        if (equal($1, {
                                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                              "$data": ({
                                                                                                                                                                                "$left": ("seconds")
                                                                                                                                                                              })
                                                                                                                                                                            })) {
                                                                                                                                                                          stratify0$3 = {
                                                                                                                                                                              "$left": ({
                                                                                                                                                                              })
                                                                                                                                                                            };
                                                                                                                                                                        } else {
                                                                                                                                                                          stratify0$3 = {
                                                                                                                                                                              "$right": (null)
                                                                                                                                                                            };
                                                                                                                                                                        };
                                                                                                                                                                        if (either(stratify0$3)) {
                                                                                                                                                                          {
                                                                                                                                                                            let $case0 = toLeft(stratify0$3);
                                                                                                                                                                            {
                                                                                                                                                                              let $0;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                                amount = natDiv(natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                            "$nat": (60.0)
                                                                                                                                                                                          }), {
                                                                                                                                                                                          "$nat": (60.0)
                                                                                                                                                                                        }), {
                                                                                                                                                                                        "$nat": (24.0)
                                                                                                                                                                                      }), {
                                                                                                                                                                                      "$nat": (7.0)
                                                                                                                                                                                    });
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        } else {
                                                                                                                                                                          {
                                                                                                                                                                            let $case1 = toRight(stratify0$3);
                                                                                                                                                                            {
                                                                                                                                                                              let stratify0$2;
                                                                                                                                                                              {
                                                                                                                                                                                ;
                                                                                                                                                                                if (equal($1, {
                                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                      "$data": ({
                                                                                                                                                                                        "$right": ({
                                                                                                                                                                                          "$left": ("minutes")
                                                                                                                                                                                        })
                                                                                                                                                                                      })
                                                                                                                                                                                    })) {
                                                                                                                                                                                  stratify0$2 = {
                                                                                                                                                                                      "$left": ({
                                                                                                                                                                                      })
                                                                                                                                                                                    };
                                                                                                                                                                                } else {
                                                                                                                                                                                  stratify0$2 = {
                                                                                                                                                                                      "$right": (null)
                                                                                                                                                                                    };
                                                                                                                                                                                };
                                                                                                                                                                                if (either(stratify0$2)) {
                                                                                                                                                                                  {
                                                                                                                                                                                    let $case0 = toLeft(stratify0$2);
                                                                                                                                                                                    {
                                                                                                                                                                                      let $0;
                                                                                                                                                                                      {
                                                                                                                                                                                        ;
                                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                                        amount = natDiv(natDiv(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                  "$nat": (60.0)
                                                                                                                                                                                                }), {
                                                                                                                                                                                                "$nat": (24.0)
                                                                                                                                                                                              }), {
                                                                                                                                                                                              "$nat": (7.0)
                                                                                                                                                                                            });
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                } else {
                                                                                                                                                                                  {
                                                                                                                                                                                    let $case1 = toRight(stratify0$2);
                                                                                                                                                                                    {
                                                                                                                                                                                      let stratify0$1;
                                                                                                                                                                                      {
                                                                                                                                                                                        ;
                                                                                                                                                                                        if (equal($1, {
                                                                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                              "$data": ({
                                                                                                                                                                                                "$right": ({
                                                                                                                                                                                                  "$right": ({
                                                                                                                                                                                                    "$left": ("hours")
                                                                                                                                                                                                  })
                                                                                                                                                                                                })
                                                                                                                                                                                              })
                                                                                                                                                                                            })) {
                                                                                                                                                                                          stratify0$1 = {
                                                                                                                                                                                              "$left": ({
                                                                                                                                                                                              })
                                                                                                                                                                                            };
                                                                                                                                                                                        } else {
                                                                                                                                                                                          stratify0$1 = {
                                                                                                                                                                                              "$right": (null)
                                                                                                                                                                                            };
                                                                                                                                                                                        };
                                                                                                                                                                                        if (either(stratify0$1)) {
                                                                                                                                                                                          {
                                                                                                                                                                                            let $case0 = toLeft(stratify0$1);
                                                                                                                                                                                            {
                                                                                                                                                                                              let $0;
                                                                                                                                                                                              {
                                                                                                                                                                                                ;
                                                                                                                                                                                                $0 = $case0;;
                                                                                                                                                                                                amount = natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                        "$nat": (24.0)
                                                                                                                                                                                                      }), {
                                                                                                                                                                                                      "$nat": (7.0)
                                                                                                                                                                                                    });
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        } else {
                                                                                                                                                                                          {
                                                                                                                                                                                            let $case1 = toRight(stratify0$1);
                                                                                                                                                                                            {
                                                                                                                                                                                              let stratify0$0;
                                                                                                                                                                                              {
                                                                                                                                                                                                ;
                                                                                                                                                                                                if (equal($1, {
                                                                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                                      "$data": ({
                                                                                                                                                                                                        "$right": ({
                                                                                                                                                                                                          "$right": ({
                                                                                                                                                                                                            "$right": ({
                                                                                                                                                                                                              "$left": ("days")
                                                                                                                                                                                                            })
                                                                                                                                                                                                          })
                                                                                                                                                                                                        })
                                                                                                                                                                                                      })
                                                                                                                                                                                                    })) {
                                                                                                                                                                                                  stratify0$0 = {
                                                                                                                                                                                                      "$left": ({
                                                                                                                                                                                                      })
                                                                                                                                                                                                    };
                                                                                                                                                                                                } else {
                                                                                                                                                                                                  stratify0$0 = {
                                                                                                                                                                                                      "$right": (null)
                                                                                                                                                                                                    };
                                                                                                                                                                                                };
                                                                                                                                                                                                if (either(stratify0$0)) {
                                                                                                                                                                                                  {
                                                                                                                                                                                                    let $case0 = toLeft(stratify0$0);
                                                                                                                                                                                                    {
                                                                                                                                                                                                      let $0;
                                                                                                                                                                                                      {
                                                                                                                                                                                                        ;
                                                                                                                                                                                                        $0 = $case0;;
                                                                                                                                                                                                        amount = natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                              "$nat": (7.0)
                                                                                                                                                                                                            });
                                                                                                                                                                                                      }
                                                                                                                                                                                                    }
                                                                                                                                                                                                  }
                                                                                                                                                                                                } else {
                                                                                                                                                                                                  {
                                                                                                                                                                                                    let $case1 = toRight(stratify0$0);
                                                                                                                                                                                                    amount = natDiv(natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                                                                              }), {
                                                                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                                                                            }), {
                                                                                                                                                                                                            "$nat": (24.0)
                                                                                                                                                                                                          }), {
                                                                                                                                                                                                          "$nat": (7.0)
                                                                                                                                                                                                        });
                                                                                                                                                                                                  }
                                                                                                                                                                                                }
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        } else {
                                                                                                                                                          {
                                                                                                                                                            let $case1 = toRight(stratify0$4);
                                                                                                                                                            {
                                                                                                                                                              let $1;
                                                                                                                                                              {
                                                                                                                                                                ;
                                                                                                                                                                $1 = recDot(unbrand(du), "unit");;
                                                                                                                                                                {
                                                                                                                                                                  let stratify0$3;
                                                                                                                                                                  {
                                                                                                                                                                    ;
                                                                                                                                                                    if (equal($1, {
                                                                                                                                                                          "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                          "$data": ({
                                                                                                                                                                            "$right": ({
                                                                                                                                                                              "$left": ("minutes")
                                                                                                                                                                            })
                                                                                                                                                                          })
                                                                                                                                                                        })) {
                                                                                                                                                                      stratify0$3 = {
                                                                                                                                                                          "$left": ({
                                                                                                                                                                          })
                                                                                                                                                                        };
                                                                                                                                                                    } else {
                                                                                                                                                                      stratify0$3 = {
                                                                                                                                                                          "$right": (null)
                                                                                                                                                                        };
                                                                                                                                                                    };
                                                                                                                                                                    if (either(stratify0$3)) {
                                                                                                                                                                      {
                                                                                                                                                                        let $case0 = toLeft(stratify0$3);
                                                                                                                                                                        {
                                                                                                                                                                          let $0;
                                                                                                                                                                          {
                                                                                                                                                                            ;
                                                                                                                                                                            $0 = $case0;;
                                                                                                                                                                            amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                  "$nat": (60.0)
                                                                                                                                                                                });
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    } else {
                                                                                                                                                                      {
                                                                                                                                                                        let $case1 = toRight(stratify0$3);
                                                                                                                                                                        {
                                                                                                                                                                          let stratify0$2;
                                                                                                                                                                          {
                                                                                                                                                                            ;
                                                                                                                                                                            if (equal($1, {
                                                                                                                                                                                  "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                  "$data": ({
                                                                                                                                                                                    "$right": ({
                                                                                                                                                                                      "$right": ({
                                                                                                                                                                                        "$left": ("hours")
                                                                                                                                                                                      })
                                                                                                                                                                                    })
                                                                                                                                                                                  })
                                                                                                                                                                                })) {
                                                                                                                                                                              stratify0$2 = {
                                                                                                                                                                                  "$left": ({
                                                                                                                                                                                  })
                                                                                                                                                                                };
                                                                                                                                                                            } else {
                                                                                                                                                                              stratify0$2 = {
                                                                                                                                                                                  "$right": (null)
                                                                                                                                                                                };
                                                                                                                                                                            };
                                                                                                                                                                            if (either(stratify0$2)) {
                                                                                                                                                                              {
                                                                                                                                                                                let $case0 = toLeft(stratify0$2);
                                                                                                                                                                                {
                                                                                                                                                                                  let $0;
                                                                                                                                                                                  {
                                                                                                                                                                                    ;
                                                                                                                                                                                    $0 = $case0;;
                                                                                                                                                                                    amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                            "$nat": (60.0)
                                                                                                                                                                                          }), {
                                                                                                                                                                                          "$nat": (60.0)
                                                                                                                                                                                        });
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            } else {
                                                                                                                                                                              {
                                                                                                                                                                                let $case1 = toRight(stratify0$2);
                                                                                                                                                                                {
                                                                                                                                                                                  let stratify0$1;
                                                                                                                                                                                  {
                                                                                                                                                                                    ;
                                                                                                                                                                                    if (equal($1, {
                                                                                                                                                                                          "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                          "$data": ({
                                                                                                                                                                                            "$right": ({
                                                                                                                                                                                              "$right": ({
                                                                                                                                                                                                "$right": ({
                                                                                                                                                                                                  "$left": ("days")
                                                                                                                                                                                                })
                                                                                                                                                                                              })
                                                                                                                                                                                            })
                                                                                                                                                                                          })
                                                                                                                                                                                        })) {
                                                                                                                                                                                      stratify0$1 = {
                                                                                                                                                                                          "$left": ({
                                                                                                                                                                                          })
                                                                                                                                                                                        };
                                                                                                                                                                                    } else {
                                                                                                                                                                                      stratify0$1 = {
                                                                                                                                                                                          "$right": (null)
                                                                                                                                                                                        };
                                                                                                                                                                                    };
                                                                                                                                                                                    if (either(stratify0$1)) {
                                                                                                                                                                                      {
                                                                                                                                                                                        let $case0 = toLeft(stratify0$1);
                                                                                                                                                                                        {
                                                                                                                                                                                          let $0;
                                                                                                                                                                                          {
                                                                                                                                                                                            ;
                                                                                                                                                                                            $0 = $case0;;
                                                                                                                                                                                            amount = natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                                                                    }), {
                                                                                                                                                                                                    "$nat": (60.0)
                                                                                                                                                                                                  }), {
                                                                                                                                                                                                  "$nat": (24.0)
                                                                                                                                                                                                });
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    } else {
                                                                                                                                                                                      {
                                                                                                                                                                                        let $case1 = toRight(stratify0$1);
                                                                                                                                                                                        {
                                                                                                                                                                                          let stratify0$0;
                                                                                                                                                                                          {
                                                                                                                                                                                            ;
                                                                                                                                                                                            if (equal($1, {
                                                                                                                                                                                                  "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                                                                  "$data": ({
                                                                                                                                                                                                    "$right": ({
                                                                                                                                                                                                      "$right": ({
                                                                                                                                                                                                        "$right": ({
                                                                                                                                                                                                          "$right": ({
                                                                                                                                                                                                            "$left": ("weeks")
                                                                                                                                                                                                          })
                                                                                                                                                                                                        })
                                                                                                                                                                                                      })
                                                                                                                                                                                                    })
                                                                                                                                                                                                  })
                                                                                                                                                                                                })) {
                                                                                                                                                                                              stratify0$0 = {
                                                                                                                                                                                                  "$left": ({
                                                                                                                                                                                                  })
                                                                                                                                                                                                };
                                                                                                                                                                                            } else {
                                                                                                                                                                                              stratify0$0 = {
                                                                                                                                                                                                  "$right": (null)
                                                                                                                                                                                                };
                                                                                                                                                                                            };
                                                                                                                                                                                            if (either(stratify0$0)) {
                                                                                                                                                                                              {
                                                                                                                                                                                                let $case0 = toLeft(stratify0$0);
                                                                                                                                                                                                {
                                                                                                                                                                                                  let $0;
                                                                                                                                                                                                  {
                                                                                                                                                                                                    ;
                                                                                                                                                                                                    $0 = $case0;;
                                                                                                                                                                                                    amount = natMult(natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                                                                              }), {
                                                                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                                                                            }), {
                                                                                                                                                                                                            "$nat": (24.0)
                                                                                                                                                                                                          }), {
                                                                                                                                                                                                          "$nat": (7.0)
                                                                                                                                                                                                        });
                                                                                                                                                                                                  }
                                                                                                                                                                                                }
                                                                                                                                                                                              }
                                                                                                                                                                                            } else {
                                                                                                                                                                                              {
                                                                                                                                                                                                let $case1 = toRight(stratify0$0);
                                                                                                                                                                                                amount = recDot(unbrand(du), "amount");
                                                                                                                                                                                              }
                                                                                                                                                                                            }
                                                                                                                                                                                          }
                                                                                                                                                                                        }
                                                                                                                                                                                      }
                                                                                                                                                                                    }
                                                                                                                                                                                  }
                                                                                                                                                                                }
                                                                                                                                                                              }
                                                                                                                                                                            }
                                                                                                                                                                          }
                                                                                                                                                                        }
                                                                                                                                                                      }
                                                                                                                                                                    }
                                                                                                                                                                  }
                                                                                                                                                                }
                                                                                                                                                              }
                                                                                                                                                            }
                                                                                                                                                          }
                                                                                                                                                        }
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                };
                                                                                                                stratify0$9 = brand(array("org.accordproject.time.Duration"), recConcat({
                                                                                                                        "unit": (u)
                                                                                                                      }, {
                                                                                                                        "amount": (amount)
                                                                                                                      }));
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      };
                                                                                      diff = recDot(unbrand(stratify0$9), "amount");
                                                                                    }
                                                                                  };
                                                                                  {
                                                                                    let penalty;
                                                                                    {
                                                                                      ;
                                                                                      {
                                                                                        let stratify0$0;
                                                                                        {
                                                                                          ;
                                                                                          {
                                                                                            let p0;
                                                                                            {
                                                                                              ;
                                                                                              p0 = diff;;
                                                                                              stratify0$0 = floatOfNat(p0);
                                                                                            }
                                                                                          };
                                                                                          {
                                                                                            let stratify1;
                                                                                            {
                                                                                              ;
                                                                                              {
                                                                                                let p0;
                                                                                                {
                                                                                                  ;
                                                                                                  p0 = recDot(unbrand(recDot(unbrand(recDot(constants0, "__contract")), "penaltyDuration")), "amount");;
                                                                                                  stratify1 = floatOfNat(p0);
                                                                                                }
                                                                                              };
                                                                                              penalty = ((((stratify0$0 / stratify1) * recDot(unbrand(recDot(constants0, "__contract")), "penaltyPercentage")) / 100.0) * recDot(unbrand(recDot(constants0, "request")), "goodsValue"));
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      };
                                                                                      {
                                                                                        let capped;
                                                                                        {
                                                                                          ;
                                                                                          {
                                                                                            let p0;
                                                                                            {
                                                                                              ;
                                                                                              p0 = union(array(penalty), array(((recDot(unbrand(recDot(constants0, "__contract")), "capPercentage") * recDot(unbrand(recDot(constants0, "request")), "goodsValue")) / 100.0)));;
                                                                                              capped = floatMin(p0);
                                                                                            }
                                                                                          };
                                                                                          ret0 = {
                                                                                              "$left": (recConcat(recConcat({
                                                                                                    "__response": (brand(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"), recConcat({
                                                                                                          "penalty": (capped)
                                                                                                        }, {
                                                                                                          "buyerMayTerminate": ((!natLe(diff, recDot(unbrand(recDot(unbrand(recDot(constants0, "__contract")), "termination")), "amount"))))
                                                                                                        })))
                                                                                                  }, {
                                                                                                    "__state": (__lstate$0)
                                                                                                  }), {
                                                                                                  "__emit": (__lemit$0)
                                                                                                }))
                                                                                            };
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          } else {
                            {
                              let $case1 = toRight(stratify0);
                              ret0 = {
                                  "$right": ({
                                    "$class": (array("org.accordproject.ergo.stdlib.Error")), 
                                    "$data": ({
                                      "message": ("Dispatch Error: no clause in the contract matches the request")
                                    })
                                  })
                                };
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      return ret0;
    }
  }
  static init(constants0) {
    {
      let ret0;
      {
        let __lstate;
        {
          ;
          __lstate = recDot(constants0, "__state");;
          {
            let __lemit;
            {
              ;
              __lemit = recDot(constants0, "__emit");;
              {
                let __this;
                {
                  ;
                  __this = recDot(constants0, "__contract");;
                  {
                    let __lstate$0;
                    {
                      ;
                      __lstate$0 = brand(array("org.accordproject.runtime.State"), {
                          });;
                      ret0 = {
                          "$left": (recConcat(recConcat({
                                "__response": (null)
                              }, {
                                "__state": (__lstate$0)
                              }), {
                              "__emit": (__lemit)
                            }))
                        };
                    }
                  }
                }
              }
            }
          }
        }
      };
      return ret0;
    }
  }
  static latedeliveryandpenalty(constants0) {
    {
      let ret0;
      {
        let __lstate;
        {
          ;
          __lstate = recDot(constants0, "__state");;
          {
            let __lemit;
            {
              ;
              __lemit = recDot(constants0, "__emit");;
              {
                let __this;
                {
                  ;
                  __this = recDot(constants0, "__contract");;
                  {
                    let agreed;
                    {
                      ;
                      agreed = recDot(unbrand(recDot(constants0, "request")), "agreedDelivery");;
                      {
                        let stratify0;
                        {
                          ;
                          {
                            let p1;
                            {
                              ;
                              p1 = agreed;;
                              {
                                let p2;
                                {
                                  ;
                                  p2 = recDot(constants0, "__now");;
                                  stratify0 = dateTimeIsBefore(p1, p2);
                                }
                              }
                            }
                          };
                          if ((!stratify0)) {
                            ret0 = {
                                "$right": (brand(array("org.accordproject.ergo.stdlib.Error"), {
                                    "message": ("Cannot exercise late delivery before delivery date")
                                  }))
                              };
                          } else {
                            if ((!((!recDot(unbrand(recDot(constants0, "__contract")), "forceMajeure")) || (!recDot(unbrand(recDot(constants0, "request")), "forceMajeure"))))) {
                              ret0 = {
                                  "$left": (recConcat(recConcat({
                                        "__response": (brand(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"), recConcat({
                                              "penalty": (0.0)
                                            }, {
                                              "buyerMayTerminate": (true)
                                            })))
                                      }, {
                                        "__state": (__lstate)
                                      }), {
                                      "__emit": (__lemit)
                                    }))
                                };
                            } else {
                              {
                                let diff;
                                {
                                  ;
                                  {
                                    let stratify0$9;
                                    {
                                      ;
                                      {
                                        let x;
                                        {
                                          ;
                                          x = recDot(constants0, "__now");;
                                          {
                                            let y;
                                            {
                                              ;
                                              y = agreed;;
                                              {
                                                let z;
                                                {
                                                  ;
                                                  z = {
                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                      "$data": ({
                                                        "$right": ({
                                                          "$right": ({
                                                            "$right": ({
                                                              "$left": ("days")
                                                            })
                                                          })
                                                        })
                                                      })
                                                    };;
                                                  {
                                                    let du;
                                                    {
                                                      ;
                                                      {
                                                        let du$0;
                                                        {
                                                          ;
                                                          {
                                                            let p1;
                                                            {
                                                              ;
                                                              p1 = x;;
                                                              {
                                                                let p2;
                                                                {
                                                                  ;
                                                                  p2 = y;;
                                                                  du$0 = dateTimeDiff(p1, p2);
                                                                }
                                                              }
                                                            }
                                                          };
                                                          {
                                                            let stratify0$0;
                                                            {
                                                              ;
                                                              {
                                                                let p0;
                                                                {
                                                                  ;
                                                                  p0 = du$0;;
                                                                  stratify0$0 = dateTimeDurationAmount(p0);
                                                                }
                                                              };
                                                              du = brand(array("org.accordproject.time.Duration"), recConcat({
                                                                      "unit": ({
                                                                        "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                        "$data": ({
                                                                          "$left": ("seconds")
                                                                        })
                                                                      })
                                                                    }, {
                                                                      "amount": (stratify0$0)
                                                                    }));
                                                            }
                                                          }
                                                        }
                                                      };
                                                      {
                                                        let u;
                                                        {
                                                          ;
                                                          u = z;;
                                                          if (equal(u, recDot(unbrand(du), "unit"))) {
                                                            stratify0$9 = du;
                                                          } else {
                                                            {
                                                              let amount;
                                                              {
                                                                ;
                                                                {
                                                                  let $match0;
                                                                  {
                                                                    ;
                                                                    $match0 = u;;
                                                                    {
                                                                      let stratify0$8;
                                                                      {
                                                                        ;
                                                                        if (equal($match0, {
                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                              "$data": ({
                                                                                "$left": ("seconds")
                                                                              })
                                                                            })) {
                                                                          stratify0$8 = {
                                                                              "$left": ({
                                                                              })
                                                                            };
                                                                        } else {
                                                                          stratify0$8 = {
                                                                              "$right": (null)
                                                                            };
                                                                        };
                                                                        if (either(stratify0$8)) {
                                                                          {
                                                                            let $case0 = toLeft(stratify0$8);
                                                                            {
                                                                              let $2;
                                                                              {
                                                                                ;
                                                                                $2 = $case0;;
                                                                                {
                                                                                  let $1;
                                                                                  {
                                                                                    ;
                                                                                    $1 = recDot(unbrand(du), "unit");;
                                                                                    {
                                                                                      let stratify0$3;
                                                                                      {
                                                                                        ;
                                                                                        if (equal($1, {
                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                              "$data": ({
                                                                                                "$right": ({
                                                                                                  "$left": ("minutes")
                                                                                                })
                                                                                              })
                                                                                            })) {
                                                                                          stratify0$3 = {
                                                                                              "$left": ({
                                                                                              })
                                                                                            };
                                                                                        } else {
                                                                                          stratify0$3 = {
                                                                                              "$right": (null)
                                                                                            };
                                                                                        };
                                                                                        if (either(stratify0$3)) {
                                                                                          {
                                                                                            let $case0 = toLeft(stratify0$3);
                                                                                            {
                                                                                              let $0;
                                                                                              {
                                                                                                ;
                                                                                                $0 = $case0;;
                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                      "$nat": (60.0)
                                                                                                    });
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        } else {
                                                                                          {
                                                                                            let $case1 = toRight(stratify0$3);
                                                                                            {
                                                                                              let stratify0$2;
                                                                                              {
                                                                                                ;
                                                                                                if (equal($1, {
                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                      "$data": ({
                                                                                                        "$right": ({
                                                                                                          "$right": ({
                                                                                                            "$left": ("hours")
                                                                                                          })
                                                                                                        })
                                                                                                      })
                                                                                                    })) {
                                                                                                  stratify0$2 = {
                                                                                                      "$left": ({
                                                                                                      })
                                                                                                    };
                                                                                                } else {
                                                                                                  stratify0$2 = {
                                                                                                      "$right": (null)
                                                                                                    };
                                                                                                };
                                                                                                if (either(stratify0$2)) {
                                                                                                  {
                                                                                                    let $case0 = toLeft(stratify0$2);
                                                                                                    {
                                                                                                      let $0;
                                                                                                      {
                                                                                                        ;
                                                                                                        $0 = $case0;;
                                                                                                        amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                "$nat": (60.0)
                                                                                                              }), {
                                                                                                              "$nat": (60.0)
                                                                                                            });
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                } else {
                                                                                                  {
                                                                                                    let $case1 = toRight(stratify0$2);
                                                                                                    {
                                                                                                      let stratify0$1;
                                                                                                      {
                                                                                                        ;
                                                                                                        if (equal($1, {
                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                              "$data": ({
                                                                                                                "$right": ({
                                                                                                                  "$right": ({
                                                                                                                    "$right": ({
                                                                                                                      "$left": ("days")
                                                                                                                    })
                                                                                                                  })
                                                                                                                })
                                                                                                              })
                                                                                                            })) {
                                                                                                          stratify0$1 = {
                                                                                                              "$left": ({
                                                                                                              })
                                                                                                            };
                                                                                                        } else {
                                                                                                          stratify0$1 = {
                                                                                                              "$right": (null)
                                                                                                            };
                                                                                                        };
                                                                                                        if (either(stratify0$1)) {
                                                                                                          {
                                                                                                            let $case0 = toLeft(stratify0$1);
                                                                                                            {
                                                                                                              let $0;
                                                                                                              {
                                                                                                                ;
                                                                                                                $0 = $case0;;
                                                                                                                amount = natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                          "$nat": (60.0)
                                                                                                                        }), {
                                                                                                                        "$nat": (60.0)
                                                                                                                      }), {
                                                                                                                      "$nat": (24.0)
                                                                                                                    });
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        } else {
                                                                                                          {
                                                                                                            let $case1 = toRight(stratify0$1);
                                                                                                            {
                                                                                                              let stratify0$0;
                                                                                                              {
                                                                                                                ;
                                                                                                                if (equal($1, {
                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                      "$data": ({
                                                                                                                        "$right": ({
                                                                                                                          "$right": ({
                                                                                                                            "$right": ({
                                                                                                                              "$right": ({
                                                                                                                                "$left": ("weeks")
                                                                                                                              })
                                                                                                                            })
                                                                                                                          })
                                                                                                                        })
                                                                                                                      })
                                                                                                                    })) {
                                                                                                                  stratify0$0 = {
                                                                                                                      "$left": ({
                                                                                                                      })
                                                                                                                    };
                                                                                                                } else {
                                                                                                                  stratify0$0 = {
                                                                                                                      "$right": (null)
                                                                                                                    };
                                                                                                                };
                                                                                                                if (either(stratify0$0)) {
                                                                                                                  {
                                                                                                                    let $case0 = toLeft(stratify0$0);
                                                                                                                    {
                                                                                                                      let $0;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        $0 = $case0;;
                                                                                                                        amount = natMult(natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                    "$nat": (60.0)
                                                                                                                                  }), {
                                                                                                                                  "$nat": (60.0)
                                                                                                                                }), {
                                                                                                                                "$nat": (24.0)
                                                                                                                              }), {
                                                                                                                              "$nat": (7.0)
                                                                                                                            });
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                } else {
                                                                                                                  {
                                                                                                                    let $case1 = toRight(stratify0$0);
                                                                                                                    amount = recDot(unbrand(du), "amount");
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        } else {
                                                                          {
                                                                            let $case1 = toRight(stratify0$8);
                                                                            {
                                                                              let stratify0$7;
                                                                              {
                                                                                ;
                                                                                if (equal($match0, {
                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                      "$data": ({
                                                                                        "$right": ({
                                                                                          "$left": ("minutes")
                                                                                        })
                                                                                      })
                                                                                    })) {
                                                                                  stratify0$7 = {
                                                                                      "$left": ({
                                                                                      })
                                                                                    };
                                                                                } else {
                                                                                  stratify0$7 = {
                                                                                      "$right": (null)
                                                                                    };
                                                                                };
                                                                                if (either(stratify0$7)) {
                                                                                  {
                                                                                    let $case0 = toLeft(stratify0$7);
                                                                                    {
                                                                                      let $2;
                                                                                      {
                                                                                        ;
                                                                                        $2 = $case0;;
                                                                                        {
                                                                                          let $1;
                                                                                          {
                                                                                            ;
                                                                                            $1 = recDot(unbrand(du), "unit");;
                                                                                            {
                                                                                              let stratify0$3;
                                                                                              {
                                                                                                ;
                                                                                                if (equal($1, {
                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                      "$data": ({
                                                                                                        "$left": ("seconds")
                                                                                                      })
                                                                                                    })) {
                                                                                                  stratify0$3 = {
                                                                                                      "$left": ({
                                                                                                      })
                                                                                                    };
                                                                                                } else {
                                                                                                  stratify0$3 = {
                                                                                                      "$right": (null)
                                                                                                    };
                                                                                                };
                                                                                                if (either(stratify0$3)) {
                                                                                                  {
                                                                                                    let $case0 = toLeft(stratify0$3);
                                                                                                    {
                                                                                                      let $0;
                                                                                                      {
                                                                                                        ;
                                                                                                        $0 = $case0;;
                                                                                                        amount = natDiv(recDot(unbrand(du), "amount"), {
                                                                                                              "$nat": (60.0)
                                                                                                            });
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                } else {
                                                                                                  {
                                                                                                    let $case1 = toRight(stratify0$3);
                                                                                                    {
                                                                                                      let stratify0$2;
                                                                                                      {
                                                                                                        ;
                                                                                                        if (equal($1, {
                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                              "$data": ({
                                                                                                                "$right": ({
                                                                                                                  "$right": ({
                                                                                                                    "$left": ("hours")
                                                                                                                  })
                                                                                                                })
                                                                                                              })
                                                                                                            })) {
                                                                                                          stratify0$2 = {
                                                                                                              "$left": ({
                                                                                                              })
                                                                                                            };
                                                                                                        } else {
                                                                                                          stratify0$2 = {
                                                                                                              "$right": (null)
                                                                                                            };
                                                                                                        };
                                                                                                        if (either(stratify0$2)) {
                                                                                                          {
                                                                                                            let $case0 = toLeft(stratify0$2);
                                                                                                            {
                                                                                                              let $0;
                                                                                                              {
                                                                                                                ;
                                                                                                                $0 = $case0;;
                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                      "$nat": (60.0)
                                                                                                                    });
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        } else {
                                                                                                          {
                                                                                                            let $case1 = toRight(stratify0$2);
                                                                                                            {
                                                                                                              let stratify0$1;
                                                                                                              {
                                                                                                                ;
                                                                                                                if (equal($1, {
                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                      "$data": ({
                                                                                                                        "$right": ({
                                                                                                                          "$right": ({
                                                                                                                            "$right": ({
                                                                                                                              "$left": ("days")
                                                                                                                            })
                                                                                                                          })
                                                                                                                        })
                                                                                                                      })
                                                                                                                    })) {
                                                                                                                  stratify0$1 = {
                                                                                                                      "$left": ({
                                                                                                                      })
                                                                                                                    };
                                                                                                                } else {
                                                                                                                  stratify0$1 = {
                                                                                                                      "$right": (null)
                                                                                                                    };
                                                                                                                };
                                                                                                                if (either(stratify0$1)) {
                                                                                                                  {
                                                                                                                    let $case0 = toLeft(stratify0$1);
                                                                                                                    {
                                                                                                                      let $0;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        $0 = $case0;;
                                                                                                                        amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                "$nat": (60.0)
                                                                                                                              }), {
                                                                                                                              "$nat": (24.0)
                                                                                                                            });
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                } else {
                                                                                                                  {
                                                                                                                    let $case1 = toRight(stratify0$1);
                                                                                                                    {
                                                                                                                      let stratify0$0;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        if (equal($1, {
                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                              "$data": ({
                                                                                                                                "$right": ({
                                                                                                                                  "$right": ({
                                                                                                                                    "$right": ({
                                                                                                                                      "$right": ({
                                                                                                                                        "$left": ("weeks")
                                                                                                                                      })
                                                                                                                                    })
                                                                                                                                  })
                                                                                                                                })
                                                                                                                              })
                                                                                                                            })) {
                                                                                                                          stratify0$0 = {
                                                                                                                              "$left": ({
                                                                                                                              })
                                                                                                                            };
                                                                                                                        } else {
                                                                                                                          stratify0$0 = {
                                                                                                                              "$right": (null)
                                                                                                                            };
                                                                                                                        };
                                                                                                                        if (either(stratify0$0)) {
                                                                                                                          {
                                                                                                                            let $case0 = toLeft(stratify0$0);
                                                                                                                            {
                                                                                                                              let $0;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                $0 = $case0;;
                                                                                                                                amount = natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                          "$nat": (60.0)
                                                                                                                                        }), {
                                                                                                                                        "$nat": (24.0)
                                                                                                                                      }), {
                                                                                                                                      "$nat": (7.0)
                                                                                                                                    });
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        } else {
                                                                                                                          {
                                                                                                                            let $case1 = toRight(stratify0$0);
                                                                                                                            amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                  "$nat": (60.0)
                                                                                                                                });
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                } else {
                                                                                  {
                                                                                    let $case1 = toRight(stratify0$7);
                                                                                    {
                                                                                      let stratify0$6;
                                                                                      {
                                                                                        ;
                                                                                        if (equal($match0, {
                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                              "$data": ({
                                                                                                "$right": ({
                                                                                                  "$right": ({
                                                                                                    "$left": ("hours")
                                                                                                  })
                                                                                                })
                                                                                              })
                                                                                            })) {
                                                                                          stratify0$6 = {
                                                                                              "$left": ({
                                                                                              })
                                                                                            };
                                                                                        } else {
                                                                                          stratify0$6 = {
                                                                                              "$right": (null)
                                                                                            };
                                                                                        };
                                                                                        if (either(stratify0$6)) {
                                                                                          {
                                                                                            let $case0 = toLeft(stratify0$6);
                                                                                            {
                                                                                              let $2;
                                                                                              {
                                                                                                ;
                                                                                                $2 = $case0;;
                                                                                                {
                                                                                                  let $1;
                                                                                                  {
                                                                                                    ;
                                                                                                    $1 = recDot(unbrand(du), "unit");;
                                                                                                    {
                                                                                                      let stratify0$3;
                                                                                                      {
                                                                                                        ;
                                                                                                        if (equal($1, {
                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                              "$data": ({
                                                                                                                "$left": ("seconds")
                                                                                                              })
                                                                                                            })) {
                                                                                                          stratify0$3 = {
                                                                                                              "$left": ({
                                                                                                              })
                                                                                                            };
                                                                                                        } else {
                                                                                                          stratify0$3 = {
                                                                                                              "$right": (null)
                                                                                                            };
                                                                                                        };
                                                                                                        if (either(stratify0$3)) {
                                                                                                          {
                                                                                                            let $case0 = toLeft(stratify0$3);
                                                                                                            {
                                                                                                              let $0;
                                                                                                              {
                                                                                                                ;
                                                                                                                $0 = $case0;;
                                                                                                                amount = natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                        "$nat": (60.0)
                                                                                                                      }), {
                                                                                                                      "$nat": (60.0)
                                                                                                                    });
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        } else {
                                                                                                          {
                                                                                                            let $case1 = toRight(stratify0$3);
                                                                                                            {
                                                                                                              let stratify0$2;
                                                                                                              {
                                                                                                                ;
                                                                                                                if (equal($1, {
                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                      "$data": ({
                                                                                                                        "$right": ({
                                                                                                                          "$left": ("minutes")
                                                                                                                        })
                                                                                                                      })
                                                                                                                    })) {
                                                                                                                  stratify0$2 = {
                                                                                                                      "$left": ({
                                                                                                                      })
                                                                                                                    };
                                                                                                                } else {
                                                                                                                  stratify0$2 = {
                                                                                                                      "$right": (null)
                                                                                                                    };
                                                                                                                };
                                                                                                                if (either(stratify0$2)) {
                                                                                                                  {
                                                                                                                    let $case0 = toLeft(stratify0$2);
                                                                                                                    {
                                                                                                                      let $0;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        $0 = $case0;;
                                                                                                                        amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                              "$nat": (60.0)
                                                                                                                            });
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                } else {
                                                                                                                  {
                                                                                                                    let $case1 = toRight(stratify0$2);
                                                                                                                    {
                                                                                                                      let stratify0$1;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        if (equal($1, {
                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                              "$data": ({
                                                                                                                                "$right": ({
                                                                                                                                  "$right": ({
                                                                                                                                    "$right": ({
                                                                                                                                      "$left": ("days")
                                                                                                                                    })
                                                                                                                                  })
                                                                                                                                })
                                                                                                                              })
                                                                                                                            })) {
                                                                                                                          stratify0$1 = {
                                                                                                                              "$left": ({
                                                                                                                              })
                                                                                                                            };
                                                                                                                        } else {
                                                                                                                          stratify0$1 = {
                                                                                                                              "$right": (null)
                                                                                                                            };
                                                                                                                        };
                                                                                                                        if (either(stratify0$1)) {
                                                                                                                          {
                                                                                                                            let $case0 = toLeft(stratify0$1);
                                                                                                                            {
                                                                                                                              let $0;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                $0 = $case0;;
                                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                      "$nat": (24.0)
                                                                                                                                    });
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        } else {
                                                                                                                          {
                                                                                                                            let $case1 = toRight(stratify0$1);
                                                                                                                            {
                                                                                                                              let stratify0$0;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                if (equal($1, {
                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                      "$data": ({
                                                                                                                                        "$right": ({
                                                                                                                                          "$right": ({
                                                                                                                                            "$right": ({
                                                                                                                                              "$right": ({
                                                                                                                                                "$left": ("weeks")
                                                                                                                                              })
                                                                                                                                            })
                                                                                                                                          })
                                                                                                                                        })
                                                                                                                                      })
                                                                                                                                    })) {
                                                                                                                                  stratify0$0 = {
                                                                                                                                      "$left": ({
                                                                                                                                      })
                                                                                                                                    };
                                                                                                                                } else {
                                                                                                                                  stratify0$0 = {
                                                                                                                                      "$right": (null)
                                                                                                                                    };
                                                                                                                                };
                                                                                                                                if (either(stratify0$0)) {
                                                                                                                                  {
                                                                                                                                    let $case0 = toLeft(stratify0$0);
                                                                                                                                    {
                                                                                                                                      let $0;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        $0 = $case0;;
                                                                                                                                        amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                "$nat": (24.0)
                                                                                                                                              }), {
                                                                                                                                              "$nat": (7.0)
                                                                                                                                            });
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                } else {
                                                                                                                                  {
                                                                                                                                    let $case1 = toRight(stratify0$0);
                                                                                                                                    amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                            "$nat": (60.0)
                                                                                                                                          }), {
                                                                                                                                          "$nat": (60.0)
                                                                                                                                        });
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        } else {
                                                                                          {
                                                                                            let $case1 = toRight(stratify0$6);
                                                                                            {
                                                                                              let stratify0$5;
                                                                                              {
                                                                                                ;
                                                                                                if (equal($match0, {
                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                      "$data": ({
                                                                                                        "$right": ({
                                                                                                          "$right": ({
                                                                                                            "$right": ({
                                                                                                              "$left": ("days")
                                                                                                            })
                                                                                                          })
                                                                                                        })
                                                                                                      })
                                                                                                    })) {
                                                                                                  stratify0$5 = {
                                                                                                      "$left": ({
                                                                                                      })
                                                                                                    };
                                                                                                } else {
                                                                                                  stratify0$5 = {
                                                                                                      "$right": (null)
                                                                                                    };
                                                                                                };
                                                                                                if (either(stratify0$5)) {
                                                                                                  {
                                                                                                    let $case0 = toLeft(stratify0$5);
                                                                                                    {
                                                                                                      let $2;
                                                                                                      {
                                                                                                        ;
                                                                                                        $2 = $case0;;
                                                                                                        {
                                                                                                          let $1;
                                                                                                          {
                                                                                                            ;
                                                                                                            $1 = recDot(unbrand(du), "unit");;
                                                                                                            {
                                                                                                              let stratify0$3;
                                                                                                              {
                                                                                                                ;
                                                                                                                if (equal($1, {
                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                      "$data": ({
                                                                                                                        "$left": ("seconds")
                                                                                                                      })
                                                                                                                    })) {
                                                                                                                  stratify0$3 = {
                                                                                                                      "$left": ({
                                                                                                                      })
                                                                                                                    };
                                                                                                                } else {
                                                                                                                  stratify0$3 = {
                                                                                                                      "$right": (null)
                                                                                                                    };
                                                                                                                };
                                                                                                                if (either(stratify0$3)) {
                                                                                                                  {
                                                                                                                    let $case0 = toLeft(stratify0$3);
                                                                                                                    {
                                                                                                                      let $0;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        $0 = $case0;;
                                                                                                                        amount = natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                  "$nat": (60.0)
                                                                                                                                }), {
                                                                                                                                "$nat": (60.0)
                                                                                                                              }), {
                                                                                                                              "$nat": (24.0)
                                                                                                                            });
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                } else {
                                                                                                                  {
                                                                                                                    let $case1 = toRight(stratify0$3);
                                                                                                                    {
                                                                                                                      let stratify0$2;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        if (equal($1, {
                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                              "$data": ({
                                                                                                                                "$right": ({
                                                                                                                                  "$left": ("minutes")
                                                                                                                                })
                                                                                                                              })
                                                                                                                            })) {
                                                                                                                          stratify0$2 = {
                                                                                                                              "$left": ({
                                                                                                                              })
                                                                                                                            };
                                                                                                                        } else {
                                                                                                                          stratify0$2 = {
                                                                                                                              "$right": (null)
                                                                                                                            };
                                                                                                                        };
                                                                                                                        if (either(stratify0$2)) {
                                                                                                                          {
                                                                                                                            let $case0 = toLeft(stratify0$2);
                                                                                                                            {
                                                                                                                              let $0;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                $0 = $case0;;
                                                                                                                                amount = natDiv(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                        "$nat": (60.0)
                                                                                                                                      }), {
                                                                                                                                      "$nat": (24.0)
                                                                                                                                    });
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        } else {
                                                                                                                          {
                                                                                                                            let $case1 = toRight(stratify0$2);
                                                                                                                            {
                                                                                                                              let stratify0$1;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                if (equal($1, {
                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                      "$data": ({
                                                                                                                                        "$right": ({
                                                                                                                                          "$right": ({
                                                                                                                                            "$left": ("hours")
                                                                                                                                          })
                                                                                                                                        })
                                                                                                                                      })
                                                                                                                                    })) {
                                                                                                                                  stratify0$1 = {
                                                                                                                                      "$left": ({
                                                                                                                                      })
                                                                                                                                    };
                                                                                                                                } else {
                                                                                                                                  stratify0$1 = {
                                                                                                                                      "$right": (null)
                                                                                                                                    };
                                                                                                                                };
                                                                                                                                if (either(stratify0$1)) {
                                                                                                                                  {
                                                                                                                                    let $case0 = toLeft(stratify0$1);
                                                                                                                                    {
                                                                                                                                      let $0;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        $0 = $case0;;
                                                                                                                                        amount = natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                              "$nat": (24.0)
                                                                                                                                            });
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                } else {
                                                                                                                                  {
                                                                                                                                    let $case1 = toRight(stratify0$1);
                                                                                                                                    {
                                                                                                                                      let stratify0$0;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        if (equal($1, {
                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                              "$data": ({
                                                                                                                                                "$right": ({
                                                                                                                                                  "$right": ({
                                                                                                                                                    "$right": ({
                                                                                                                                                      "$right": ({
                                                                                                                                                        "$left": ("weeks")
                                                                                                                                                      })
                                                                                                                                                    })
                                                                                                                                                  })
                                                                                                                                                })
                                                                                                                                              })
                                                                                                                                            })) {
                                                                                                                                          stratify0$0 = {
                                                                                                                                              "$left": ({
                                                                                                                                              })
                                                                                                                                            };
                                                                                                                                        } else {
                                                                                                                                          stratify0$0 = {
                                                                                                                                              "$right": (null)
                                                                                                                                            };
                                                                                                                                        };
                                                                                                                                        if (either(stratify0$0)) {
                                                                                                                                          {
                                                                                                                                            let $case0 = toLeft(stratify0$0);
                                                                                                                                            {
                                                                                                                                              let $0;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                $0 = $case0;;
                                                                                                                                                amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                      "$nat": (7.0)
                                                                                                                                                    });
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        } else {
                                                                                                                                          {
                                                                                                                                            let $case1 = toRight(stratify0$0);
                                                                                                                                            amount = natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                    }), {
                                                                                                                                                    "$nat": (60.0)
                                                                                                                                                  }), {
                                                                                                                                                  "$nat": (24.0)
                                                                                                                                                });
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                } else {
                                                                                                  {
                                                                                                    let $case1 = toRight(stratify0$5);
                                                                                                    {
                                                                                                      let stratify0$4;
                                                                                                      {
                                                                                                        ;
                                                                                                        if (equal($match0, {
                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                              "$data": ({
                                                                                                                "$right": ({
                                                                                                                  "$right": ({
                                                                                                                    "$right": ({
                                                                                                                      "$right": ({
                                                                                                                        "$left": ("weeks")
                                                                                                                      })
                                                                                                                    })
                                                                                                                  })
                                                                                                                })
                                                                                                              })
                                                                                                            })) {
                                                                                                          stratify0$4 = {
                                                                                                              "$left": ({
                                                                                                              })
                                                                                                            };
                                                                                                        } else {
                                                                                                          stratify0$4 = {
                                                                                                              "$right": (null)
                                                                                                            };
                                                                                                        };
                                                                                                        if (either(stratify0$4)) {
                                                                                                          {
                                                                                                            let $case0 = toLeft(stratify0$4);
                                                                                                            {
                                                                                                              let $2;
                                                                                                              {
                                                                                                                ;
                                                                                                                $2 = $case0;;
                                                                                                                {
                                                                                                                  let $1;
                                                                                                                  {
                                                                                                                    ;
                                                                                                                    $1 = recDot(unbrand(du), "unit");;
                                                                                                                    {
                                                                                                                      let stratify0$3;
                                                                                                                      {
                                                                                                                        ;
                                                                                                                        if (equal($1, {
                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                              "$data": ({
                                                                                                                                "$left": ("seconds")
                                                                                                                              })
                                                                                                                            })) {
                                                                                                                          stratify0$3 = {
                                                                                                                              "$left": ({
                                                                                                                              })
                                                                                                                            };
                                                                                                                        } else {
                                                                                                                          stratify0$3 = {
                                                                                                                              "$right": (null)
                                                                                                                            };
                                                                                                                        };
                                                                                                                        if (either(stratify0$3)) {
                                                                                                                          {
                                                                                                                            let $case0 = toLeft(stratify0$3);
                                                                                                                            {
                                                                                                                              let $0;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                $0 = $case0;;
                                                                                                                                amount = natDiv(natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                            "$nat": (60.0)
                                                                                                                                          }), {
                                                                                                                                          "$nat": (60.0)
                                                                                                                                        }), {
                                                                                                                                        "$nat": (24.0)
                                                                                                                                      }), {
                                                                                                                                      "$nat": (7.0)
                                                                                                                                    });
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        } else {
                                                                                                                          {
                                                                                                                            let $case1 = toRight(stratify0$3);
                                                                                                                            {
                                                                                                                              let stratify0$2;
                                                                                                                              {
                                                                                                                                ;
                                                                                                                                if (equal($1, {
                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                      "$data": ({
                                                                                                                                        "$right": ({
                                                                                                                                          "$left": ("minutes")
                                                                                                                                        })
                                                                                                                                      })
                                                                                                                                    })) {
                                                                                                                                  stratify0$2 = {
                                                                                                                                      "$left": ({
                                                                                                                                      })
                                                                                                                                    };
                                                                                                                                } else {
                                                                                                                                  stratify0$2 = {
                                                                                                                                      "$right": (null)
                                                                                                                                    };
                                                                                                                                };
                                                                                                                                if (either(stratify0$2)) {
                                                                                                                                  {
                                                                                                                                    let $case0 = toLeft(stratify0$2);
                                                                                                                                    {
                                                                                                                                      let $0;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        $0 = $case0;;
                                                                                                                                        amount = natDiv(natDiv(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                  "$nat": (60.0)
                                                                                                                                                }), {
                                                                                                                                                "$nat": (24.0)
                                                                                                                                              }), {
                                                                                                                                              "$nat": (7.0)
                                                                                                                                            });
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                } else {
                                                                                                                                  {
                                                                                                                                    let $case1 = toRight(stratify0$2);
                                                                                                                                    {
                                                                                                                                      let stratify0$1;
                                                                                                                                      {
                                                                                                                                        ;
                                                                                                                                        if (equal($1, {
                                                                                                                                              "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                              "$data": ({
                                                                                                                                                "$right": ({
                                                                                                                                                  "$right": ({
                                                                                                                                                    "$left": ("hours")
                                                                                                                                                  })
                                                                                                                                                })
                                                                                                                                              })
                                                                                                                                            })) {
                                                                                                                                          stratify0$1 = {
                                                                                                                                              "$left": ({
                                                                                                                                              })
                                                                                                                                            };
                                                                                                                                        } else {
                                                                                                                                          stratify0$1 = {
                                                                                                                                              "$right": (null)
                                                                                                                                            };
                                                                                                                                        };
                                                                                                                                        if (either(stratify0$1)) {
                                                                                                                                          {
                                                                                                                                            let $case0 = toLeft(stratify0$1);
                                                                                                                                            {
                                                                                                                                              let $0;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                $0 = $case0;;
                                                                                                                                                amount = natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                        "$nat": (24.0)
                                                                                                                                                      }), {
                                                                                                                                                      "$nat": (7.0)
                                                                                                                                                    });
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        } else {
                                                                                                                                          {
                                                                                                                                            let $case1 = toRight(stratify0$1);
                                                                                                                                            {
                                                                                                                                              let stratify0$0;
                                                                                                                                              {
                                                                                                                                                ;
                                                                                                                                                if (equal($1, {
                                                                                                                                                      "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                      "$data": ({
                                                                                                                                                        "$right": ({
                                                                                                                                                          "$right": ({
                                                                                                                                                            "$right": ({
                                                                                                                                                              "$left": ("days")
                                                                                                                                                            })
                                                                                                                                                          })
                                                                                                                                                        })
                                                                                                                                                      })
                                                                                                                                                    })) {
                                                                                                                                                  stratify0$0 = {
                                                                                                                                                      "$left": ({
                                                                                                                                                      })
                                                                                                                                                    };
                                                                                                                                                } else {
                                                                                                                                                  stratify0$0 = {
                                                                                                                                                      "$right": (null)
                                                                                                                                                    };
                                                                                                                                                };
                                                                                                                                                if (either(stratify0$0)) {
                                                                                                                                                  {
                                                                                                                                                    let $case0 = toLeft(stratify0$0);
                                                                                                                                                    {
                                                                                                                                                      let $0;
                                                                                                                                                      {
                                                                                                                                                        ;
                                                                                                                                                        $0 = $case0;;
                                                                                                                                                        amount = natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                              "$nat": (7.0)
                                                                                                                                                            });
                                                                                                                                                      }
                                                                                                                                                    }
                                                                                                                                                  }
                                                                                                                                                } else {
                                                                                                                                                  {
                                                                                                                                                    let $case1 = toRight(stratify0$0);
                                                                                                                                                    amount = natDiv(natDiv(natDiv(natDiv(recDot(unbrand(du), "amount"), {
                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                              }), {
                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                            }), {
                                                                                                                                                            "$nat": (24.0)
                                                                                                                                                          }), {
                                                                                                                                                          "$nat": (7.0)
                                                                                                                                                        });
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        } else {
                                                                                                          {
                                                                                                            let $case1 = toRight(stratify0$4);
                                                                                                            {
                                                                                                              let $1;
                                                                                                              {
                                                                                                                ;
                                                                                                                $1 = recDot(unbrand(du), "unit");;
                                                                                                                {
                                                                                                                  let stratify0$3;
                                                                                                                  {
                                                                                                                    ;
                                                                                                                    if (equal($1, {
                                                                                                                          "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                          "$data": ({
                                                                                                                            "$right": ({
                                                                                                                              "$left": ("minutes")
                                                                                                                            })
                                                                                                                          })
                                                                                                                        })) {
                                                                                                                      stratify0$3 = {
                                                                                                                          "$left": ({
                                                                                                                          })
                                                                                                                        };
                                                                                                                    } else {
                                                                                                                      stratify0$3 = {
                                                                                                                          "$right": (null)
                                                                                                                        };
                                                                                                                    };
                                                                                                                    if (either(stratify0$3)) {
                                                                                                                      {
                                                                                                                        let $case0 = toLeft(stratify0$3);
                                                                                                                        {
                                                                                                                          let $0;
                                                                                                                          {
                                                                                                                            ;
                                                                                                                            $0 = $case0;;
                                                                                                                            amount = natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                  "$nat": (60.0)
                                                                                                                                });
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    } else {
                                                                                                                      {
                                                                                                                        let $case1 = toRight(stratify0$3);
                                                                                                                        {
                                                                                                                          let stratify0$2;
                                                                                                                          {
                                                                                                                            ;
                                                                                                                            if (equal($1, {
                                                                                                                                  "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                  "$data": ({
                                                                                                                                    "$right": ({
                                                                                                                                      "$right": ({
                                                                                                                                        "$left": ("hours")
                                                                                                                                      })
                                                                                                                                    })
                                                                                                                                  })
                                                                                                                                })) {
                                                                                                                              stratify0$2 = {
                                                                                                                                  "$left": ({
                                                                                                                                  })
                                                                                                                                };
                                                                                                                            } else {
                                                                                                                              stratify0$2 = {
                                                                                                                                  "$right": (null)
                                                                                                                                };
                                                                                                                            };
                                                                                                                            if (either(stratify0$2)) {
                                                                                                                              {
                                                                                                                                let $case0 = toLeft(stratify0$2);
                                                                                                                                {
                                                                                                                                  let $0;
                                                                                                                                  {
                                                                                                                                    ;
                                                                                                                                    $0 = $case0;;
                                                                                                                                    amount = natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                            "$nat": (60.0)
                                                                                                                                          }), {
                                                                                                                                          "$nat": (60.0)
                                                                                                                                        });
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            } else {
                                                                                                                              {
                                                                                                                                let $case1 = toRight(stratify0$2);
                                                                                                                                {
                                                                                                                                  let stratify0$1;
                                                                                                                                  {
                                                                                                                                    ;
                                                                                                                                    if (equal($1, {
                                                                                                                                          "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                          "$data": ({
                                                                                                                                            "$right": ({
                                                                                                                                              "$right": ({
                                                                                                                                                "$right": ({
                                                                                                                                                  "$left": ("days")
                                                                                                                                                })
                                                                                                                                              })
                                                                                                                                            })
                                                                                                                                          })
                                                                                                                                        })) {
                                                                                                                                      stratify0$1 = {
                                                                                                                                          "$left": ({
                                                                                                                                          })
                                                                                                                                        };
                                                                                                                                    } else {
                                                                                                                                      stratify0$1 = {
                                                                                                                                          "$right": (null)
                                                                                                                                        };
                                                                                                                                    };
                                                                                                                                    if (either(stratify0$1)) {
                                                                                                                                      {
                                                                                                                                        let $case0 = toLeft(stratify0$1);
                                                                                                                                        {
                                                                                                                                          let $0;
                                                                                                                                          {
                                                                                                                                            ;
                                                                                                                                            $0 = $case0;;
                                                                                                                                            amount = natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                      "$nat": (60.0)
                                                                                                                                                    }), {
                                                                                                                                                    "$nat": (60.0)
                                                                                                                                                  }), {
                                                                                                                                                  "$nat": (24.0)
                                                                                                                                                });
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    } else {
                                                                                                                                      {
                                                                                                                                        let $case1 = toRight(stratify0$1);
                                                                                                                                        {
                                                                                                                                          let stratify0$0;
                                                                                                                                          {
                                                                                                                                            ;
                                                                                                                                            if (equal($1, {
                                                                                                                                                  "$class": (array("org.accordproject.time.TemporalUnit")), 
                                                                                                                                                  "$data": ({
                                                                                                                                                    "$right": ({
                                                                                                                                                      "$right": ({
                                                                                                                                                        "$right": ({
                                                                                                                                                          "$right": ({
                                                                                                                                                            "$left": ("weeks")
                                                                                                                                                          })
                                                                                                                                                        })
                                                                                                                                                      })
                                                                                                                                                    })
                                                                                                                                                  })
                                                                                                                                                })) {
                                                                                                                                              stratify0$0 = {
                                                                                                                                                  "$left": ({
                                                                                                                                                  })
                                                                                                                                                };
                                                                                                                                            } else {
                                                                                                                                              stratify0$0 = {
                                                                                                                                                  "$right": (null)
                                                                                                                                                };
                                                                                                                                            };
                                                                                                                                            if (either(stratify0$0)) {
                                                                                                                                              {
                                                                                                                                                let $case0 = toLeft(stratify0$0);
                                                                                                                                                {
                                                                                                                                                  let $0;
                                                                                                                                                  {
                                                                                                                                                    ;
                                                                                                                                                    $0 = $case0;;
                                                                                                                                                    amount = natMult(natMult(natMult(natMult(recDot(unbrand(du), "amount"), {
                                                                                                                                                                "$nat": (60.0)
                                                                                                                                                              }), {
                                                                                                                                                              "$nat": (60.0)
                                                                                                                                                            }), {
                                                                                                                                                            "$nat": (24.0)
                                                                                                                                                          }), {
                                                                                                                                                          "$nat": (7.0)
                                                                                                                                                        });
                                                                                                                                                  }
                                                                                                                                                }
                                                                                                                                              }
                                                                                                                                            } else {
                                                                                                                                              {
                                                                                                                                                let $case1 = toRight(stratify0$0);
                                                                                                                                                amount = recDot(unbrand(du), "amount");
                                                                                                                                              }
                                                                                                                                            }
                                                                                                                                          }
                                                                                                                                        }
                                                                                                                                      }
                                                                                                                                    }
                                                                                                                                  }
                                                                                                                                }
                                                                                                                              }
                                                                                                                            }
                                                                                                                          }
                                                                                                                        }
                                                                                                                      }
                                                                                                                    }
                                                                                                                  }
                                                                                                                }
                                                                                                              }
                                                                                                            }
                                                                                                          }
                                                                                                        }
                                                                                                      }
                                                                                                    }
                                                                                                  }
                                                                                                }
                                                                                              }
                                                                                            }
                                                                                          }
                                                                                        }
                                                                                      }
                                                                                    }
                                                                                  }
                                                                                }
                                                                              }
                                                                            }
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                };
                                                                stratify0$9 = brand(array("org.accordproject.time.Duration"), recConcat({
                                                                        "unit": (u)
                                                                      }, {
                                                                        "amount": (amount)
                                                                      }));
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      };
                                      diff = recDot(unbrand(stratify0$9), "amount");
                                    }
                                  };
                                  {
                                    let penalty;
                                    {
                                      ;
                                      {
                                        let stratify0$0;
                                        {
                                          ;
                                          {
                                            let p0;
                                            {
                                              ;
                                              p0 = diff;;
                                              stratify0$0 = floatOfNat(p0);
                                            }
                                          };
                                          {
                                            let stratify1;
                                            {
                                              ;
                                              {
                                                let p0;
                                                {
                                                  ;
                                                  p0 = recDot(unbrand(recDot(unbrand(recDot(constants0, "__contract")), "penaltyDuration")), "amount");;
                                                  stratify1 = floatOfNat(p0);
                                                }
                                              };
                                              penalty = ((((stratify0$0 / stratify1) * recDot(unbrand(recDot(constants0, "__contract")), "penaltyPercentage")) / 100.0) * recDot(unbrand(recDot(constants0, "request")), "goodsValue"));
                                            }
                                          }
                                        }
                                      };
                                      {
                                        let capped;
                                        {
                                          ;
                                          {
                                            let p0;
                                            {
                                              ;
                                              p0 = union(array(penalty), array(((recDot(unbrand(recDot(constants0, "__contract")), "capPercentage") * recDot(unbrand(recDot(constants0, "request")), "goodsValue")) / 100.0)));;
                                              capped = floatMin(p0);
                                            }
                                          };
                                          ret0 = {
                                              "$left": (recConcat(recConcat({
                                                    "__response": (brand(array("org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"), recConcat({
                                                          "penalty": (capped)
                                                        }, {
                                                          "buyerMayTerminate": ((!natLe(diff, recDot(unbrand(recDot(unbrand(recDot(constants0, "__contract")), "termination")), "amount"))))
                                                        })))
                                                  }, {
                                                    "__state": (__lstate)
                                                  }), {
                                                  "__emit": (__lemit)
                                                }))
                                            };
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      };
      return ret0;
    }
  }
}
/*eslint-enable no-unused-vars*/
/*eslint-enable no-undef*/
function __dispatch(context) {
  let pcontext = Object.assign(context, { 'request' : context.request });
  return orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty.main(pcontext);
}
function __init(context) {
  let pcontext = Object.assign(context, { 'state': { '$class': 'org.accordproject.runtime.State' } });
  return new orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty().init(pcontext);
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

/* JavaScript runtime for core operators */

/* Utilities */
function boxNat(v) {
    return { '$nat': v };
}
function unboxNat(v) {
    return v['$nat'];
}
function isNat(v) {
    return Object.prototype.hasOwnProperty.call(v,'$nat');
}
function boxColl(v, len) {
    len = (typeof len !== 'undefined') ?  len : v.length;
    return { '$coll': v, '$length': len };
}
function unboxColl(v) {
    return v['$coll'];
}
function isBoxColl(obj) {
    return (Object.prototype.hasOwnProperty.call(obj,'$coll') &&
            Object.prototype.hasOwnProperty.call(obj,'$length'));
}
function collLength(v) {
    return v['$length'];
}
function boxLeft(v) {
    return { '$left' : v };
}
function unboxLeft(v) {
    return v['$left'];
}
function isLeft(v) {
    return Object.prototype.hasOwnProperty.call(v,'$left');
}
function boxRight(v) {
    return { '$right' : v };
}
function unboxRight(v) {
    return v['$right'];
}
function isRight(v) {
    return Object.prototype.hasOwnProperty.call(v,'$right');
}
function sub_brand(b1,b2) {
    var bsub=null;
    var bsup=null;
    var inheritanceUnbox = isBoxColl(inheritance)?unboxColl(inheritance):inheritance;
    for (var i=0; i<inheritanceUnbox.length; i=i+1) {
        bsub = inheritanceUnbox[i].sub;
        bsup = inheritanceUnbox[i].sup;
        if ((b1 === bsub) && (b2 === bsup)) { return true; }
    }
    return false;
}
// from: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions?redirectlocale=en-US&redirectslug=JavaScript%2FGuide%2FRegular_Expressions
function escapeRegExp(string){
    return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, '\\$1');
}

/* Generic */
function equal(v1, v2) {
    return compare(v1, v2) === 0;
}
function compare(v1, v2) {
    var t1 = typeof v1, t2 = typeof v2;
    if (t1 === 'object' && v1 !== null) {
        if (isNat(v1)) { t1 = 'number'; v1 = unboxNat(v1); }
        if (isBoxColl(v1)) {
	          v1 = unboxColl(v1).slice(0, collLength(v1));
	      }
    };
    if (t2 === 'object' && v2 !== null) {
        if (isNat(v2)) { t2 = 'number'; v2 = unboxNat(v2); }
        if (isBoxColl(v2)) {
	          v2 = unboxColl(v2).slice(0, collLength(v2));
	      }
    }
    if (t1 != t2) {
        return t1 < t2 ? -1 : +1;
    }
    var a1 = {}.toString.apply(v1), a2 = {}.toString.apply(v2);
    if (a1 != a2) {
        return a1 < a2 ? -1 : +1;
    }
    if (a1 === '[object Array]') {
        v1 = v1.slice(); /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
        v2 = v2.slice(); /* So we do the sort/compare on a clone of the original array */
        v1.sort(compare);
        v2.sort(compare);
    }
    if (t1 === 'object') {
        var fields1 = [];
        var fields2 = [];
        for (var f1 in v1) { fields1.push(f1); }
        for (var f2 in v2) { fields2.push(f2); }
        fields1 = fields1.sort(compare);
        fields2 = fields2.sort(compare);
        for (var i = 0; i < fields1.length; i=i+1) {
            if (!(Object.prototype.hasOwnProperty.call(v2,fields1[i]))) {
                return -1;
            }
            var fc = compare(v1[fields1[i]], v2[fields1[i]]);
            if (fc != 0) {
                return fc;
            }
        }
        for (var i = 0; i < fields2.length; i=i+1) {
            if (!(Object.prototype.hasOwnProperty.call(v1,fields2[i]))) {
                return +1;
            }
        }
        return 0;
    }
    if (v1 != v2) {
        return v1 < v2 ? -1 : +1;
    }
    return 0;
}

/* Record */
function recConcat(r1, r2) {
    var result = { };
    for (var key2 in r2) {
        result[key2] = r2[key2];
    }
    for (var key1 in r1) {
        if (!(Object.prototype.hasOwnProperty.call(r2,key1))) {
            result[key1] = r1[key1];
        }
    }
    return result;
}
function recMerge(r1, r2) {
    var result = { };
    for (var key1 in r1) {
        result[key1] = r1[key1];
    }
    for (var key2 in r2) {
        if (Object.prototype.hasOwnProperty.call(r1,key2)) {
            if (!equal(r1[key2], r2[key2])) {
                return [ ];
            }
        } else {
            result[key2] = r2[key2];
        }
    }
    return [ result ];
}
function recRemove(r, f) {
    var result = { };
    for (var key in r) {
        if (key != f) {
            result[key] = r[key];
        }
    }
    return result;
}
function recProject(r1, p2) {
    var result = { };
    for (var key1 in r1) {
        if (!(p2.indexOf(key1) === -1)) {
            result[key1] = r1[key1];
        }
    }
    return result;
}
function recDot(receiver, member) {
    if (typeof receiver === 'object' && Object.prototype.hasOwnProperty.call(receiver,member)) {
        return receiver[member];
    }
    throw new Error('TypeError: recDot(' + member +') called on non-record (' + JSON.stringify(receiver) + ')');
}

/* Array */
function array(...args) {
    return boxColl(Array.of(...args));
}
function arrayLength(v) {
    return boxNat(v.$length);
}
function arrayPush(v1,v2) {
    var content1 = unboxColl(v1);
    if (content1.length !== collLength(v1)) {
	      content1 = content1.slice(0, collLength(length));
    }
    content1.push(v2);
    return boxColl(content1);
}
function arrayAccess(v1,v2) {
    var content1 = unboxColl(v1);
    return content1[unboxNat(v2)];
}

/* Sum */
function either(v) {
    if (typeof v === 'object') {
        if (isLeft(v)) {
            return true;
        } else if (isRight(v)) {
            return false;
        } else {
            throw new Error('TypeError: either called on non-sum');
        }
    }
    throw new Error('TypeError: either called on non-sum');
}
function toLeft(v) {
    if (typeof v === 'object' && isLeft(v)) {
        return unboxLeft(v);
    }
    throw new Error('TypeError: toLeft called on non-sum');
}
function toRight(v) {
    if (typeof v === 'object' && isRight(v)) {
        return unboxRight(v);
    }
    throw new Error('TypeError: toRight called on non-sum');
}

/* Brand */
function brand(b,v) {
    return { '$class' : b, '$data' : v };
}
function unbrand(v) {
    if (typeof v === 'object' && Object.prototype.hasOwnProperty.call(v,'$class') && Object.prototype.hasOwnProperty.call(v,'$data')) {
        return v.$data;
    }
    throw new Error('TypeError: unbrand called on non-object (' + JSON.stringify(v) + ')');
}
function cast(brands,v) {
    var brandsUnbox = isBoxColl(brands) ? unboxColl(brands) : brands;
    var type = isBoxColl(v.$class) ? unboxColl(v.$class) : v.$class;
    if (brandsUnbox.length === 1 && brandsUnbox[0] === 'Any') { /* cast to top of inheritance is built-in */
        return boxLeft(v);
    }
    brands:
    for (var i in brandsUnbox) {
        var b = brandsUnbox[i];
        for (var j in type) {
            var t = type[j];
            if (equal(t,b) || sub_brand(t,b)) {
                continue brands;
            }
        }
        /* the brand b does not appear in the type, so the cast fails */
        return boxRight(null);
    }
    /* All brands appear in the type, so the cast succeeds */
    return boxLeft(v);
}

/* Collection */
function iterColl(b, f) {
    var content = unboxColl(b);
    for (let i = 0; i < collLength(b); i++) {
	      f(content[i]);
    }
}
function distinct(b) {
    var result = [ ];
    var content = unboxColl(b);
    for (var i=0; i < collLength(b); i=i+1) {
        var v = content[i];
        var dup = false;
        for (var j=i+1; j < collLength(b); j=j+1) {
            if (equal(v,content[j])) { dup = true; break; }
        }
        if (!(dup)) { result.push(v); } else { dup = false; }
    }
    return boxColl(result);
}
function singleton(v) {
    var content = unboxColl(v);
    if (collLength(v) === 1) {
        return boxLeft(content[0]);
    } else {
        return boxRight(null); /* Not a singleton */
    }
}
function flatten(aOuter) {
    var result = [ ];
    var aOuterContent = unboxColl(aOuter);
    for (var iOuter=0, nOuter=collLength(aOuter); iOuter<nOuter; iOuter = iOuter+1) {
        var aInner = aOuterContent[iOuter];
        var aInnerContent = unboxColl(aInner);
        for (var iInner=0, nInner=collLength(aInner); iInner<nInner; iInner = iInner+1) {
            result.push(aInnerContent[iInner]);
        }
    }
    return boxColl(result);
}
function union(b1, b2) {
    var content1 = unboxColl(b1);
    var content2 = unboxColl(b2);
    if (content1.length !== collLength(b1)) {
	      content1 = content1.slice(0, collLength(b1));
    }
    for (let i = 0; i < content2.length; i++) {
        content1.push(content2[i]);
    }
    var result = boxColl(content1);
    return result;
}
function minus(b1, b2) {
    var result = [ ];
    var v1 = unboxColl(b1).slice(0, collLength(b1));
    var v2 = unboxColl(b2).slice(0, collLength(b2));
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1=i1+1) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) === 1)) i2=i2+1;
        if (i2 < length2) {
            if (compare(v1[i1],v2[i2]) === (-1)) { result.push(v1[i1]); } else { i2=i2+1; }
        } else {
            result.push(v1[i1]);
        }
    }
    return boxColl(result);
}
function min(b1, b2) {
    var result = [ ];
    var v1 = unboxColl(b1).slice(0, collLength(b1));
    var v2 = unboxColl(b2).slice(0, collLength(b2));
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1=i1+1) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) === 1)) i2=i2+1;
        if (i2 < length2) {
            if (compare(v1[i1],v2[i2]) === 0) result.push(v1[i1]);
        }
    }
    return boxColl(result);
}
function max(b1, b2) {
    var result = [ ];
    var v1 = unboxColl(b1).slice(0, collLength(b1));
    var v2 = unboxColl(b2).slice(0, collLength(b2));
    v1.sort(compare);
    v2.sort(compare);
    var i2=0;
    var length2=v2.length;
    var comp=0;
    for (var i1=0; i1<v1.length; i1=i1+1) {
        while ((i2 < length2) && (compare(v1[i1],v2[i2]) === 1)) { result.push(v2[i2]); i2=i2+1; }
        if (i2 < length2) {
            if (compare(v1[i1],v2[i2]) === 0) i2=i2+1;
        }
        result.push(v1[i1]);
    }
    while (i2 < length2) { result.push(v2[i2]); i2=i2+1; }
    return boxColl(result);
}
function nth(b1, n) {
    var index = n;
    var content = unboxColl(b1);
    if (isNat(n)){
        index = unboxNat(n);
    }
    if (0 <= index && index < collLength(b1)) {
        return boxLeft(content[index]);
    } else {
        return boxRight(null);
    }
}
function count(v) {
    return arrayLength(v);
}
function contains(v, b) {
    var content = unboxColl(b);
    for (var i=0; i<collLength(b); i=i+1) {
        if (equal(v, content[i])) {
            return true;
        }
    }
    return false;
}
function compareOfMultipleCriterias(scl) {
    return function(a,b) {
        var current_compare = 0;
        for (var i=0; i<scl.length; i=i+1) {
            var sc = scl[i];
            if (Object.prototype.hasOwnProperty.call(sc,'asc')) { current_compare = compare(recDot(a,sc['asc']), recDot(b,sc['asc'])); }
            else if (Object.prototype.hasOwnProperty.call(sc,'desc')) { current_compare = -(compare(recDot(a,sc['asc']), recDot(b,sc['asc']))); }

            if (current_compare === -1) { return -1; }
            else if (current_compare === 1) { return 1; }
        }
        return current_compare;
    }
    
}
function sort(b,scl) {
    if (scl.length === 0) { return b; } // Check for no sorting criteria
    var compareFun = compareOfMultipleCriterias(scl);
    /* Sorting in place leads to inconsistencies, notably as it re-orders the input WM in the middle of processing */
    var result = unboxColl(b).slice(0, collLength(b));
    result.sort(compareFun);
    return boxColl(result);
}
function groupByOfKey(l,k,keysf) {
    var result = [ ];
    l.forEach((x) => {
        if (equal(keysf(x),k)) {
            result.push(x);
        }
    });
    return boxColl(result);
}
function groupByNested(l,keysf) {
    var keys = unboxColl(distinct(boxColl(l.map(keysf))));
    var result = [ ];
    keys.forEach((k) => {
        result.push({ 'keys': k, 'group' : groupByOfKey(l,k,keysf) });
    });
    return result;
}
function groupBy(g,kl,l) {
    l = unboxColl(l).slice(0, collLength(l));
    kl = unboxColl(kl).slice(0, collLength(kl));
    // g is partition name
    // kl is key list
    // l is input collection of records
    var keysf = function (j) {
        return recProject(j,kl);
    };
    var grouped = groupByNested(l,keysf);
    var result = [ ];
    grouped.forEach((x) => {
        var gRec = {};
        gRec[g] = x.group;
        result.push(recConcat(x.keys, gRec));
    });
    return boxColl(result);
}

/* String */
function length(v) {
    return boxNat(v.length);
}
function substring(v, start, len) {
    return v.substring(unboxNat(start),unboxNat(len));
}
function substringEnd(v, start) {
    return v.substring(unboxNat(start));
}
function stringJoin(sep, v) {
    var content = unboxColl(v).slice(0, collLength(v));
    return content.join(sep);
}
function like(pat, s) {
    var reg1 = escapeRegExp(pat);
    var reg2 = reg1.replace(/_/g, '.').replace(/%/g, '.*');
    var reg3 = new RegExp(reg2);
    return reg3.test(s);
}

/* Integer */
function natLt(v1, v2) {
    return unboxNat(v1) < unboxNat(v2);
}
function natLe(v1, v2) {
    return unboxNat(v1) <= unboxNat(v2);
}
function natPlus(v1, v2) {
    return boxNat(unboxNat(v1) + unboxNat(v2));
}
function natMinus(v1, v2) {
    return boxNat(unboxNat(v1) - unboxNat(v2));
}
function natMult(v1, v2) {
    return boxNat(unboxNat(v1) * unboxNat(v2));
}
function natDiv(v1, v2) {
    return boxNat(Math.floor(unboxNat(v1) / unboxNat(v2)));
}
function natRem(v1, v2) {
    return boxNat(Math.floor(unboxNat(v1) % unboxNat(v2)));
}
function natAbs(v) {
    return boxNat(Math.abs(unboxNat(v1),unboxNat(v2)));
}
function natLog2(v) {
    return boxNat(Math.floor(Math.log2(unboxNat(v)))); // Default Z.log2 is log_inf, biggest integer lower than log2
}
function natSqrt(v) {
    return boxNat(Math.floor(Math.sqrt(unboxNat(v)))); // See Z.sqrt biggest integer lower than sqrt
}
function natMinPair(v1, v2) {
    return boxNat(Math.min(unboxNat(v1),unboxNat(v2)));
}
function natMaxPair(v1, v2) {
    return boxNat(Math.max(unboxNat(v1),unboxNat(v2)));
}
function natSum(b) {
    var content = unboxColl(b);
    var result = 0;
    for (var i=0; i<collLength(b); i=i+1) {
        result += unboxNat(content[i]);
    }
    return boxNat(result);
}
function natMin(b) {
    var content = unboxColl(b);
    var numbers = [ ];
    for (var i=0; i<collLength(b); i=i+1) {
        numbers.push(unboxNat(content[i]));
    }
    return boxNat(Math.min.apply(Math,numbers));
}
function natMax(b) {
    var content = unboxColl(b);
    var numbers = [ ];
    for (var i=0; i<collLength(b); i=i+1) {
        numbers.push(unboxNat(content[i]));
    }
    return boxNat(Math.max.apply(Math,numbers));
}
function natArithMean(b) {
    var len = collLength(b);
    if (len === 0) {
        return boxNat(0);
    } else {
        return boxNat(Math.floor(unboxNat(natSum(b))/len));
    }
}
function floatOfNat(v) {
    return unboxNat(v);
}

/* Float */
function floatSum(b) {
    var content = unboxColl(b);
    var result = 0;
    for (var i=0; i<collLength(b); i=i+1) {
        result += content[i];
    }
    return result;
}
function floatArithMean(b) {
    var len = collLength(b);
    if (len === 0) {
        return 0;
    } else {
        return floatSum(b)/len;
    }
}
function floatMin(b) {
    var content = unboxColl(b).slice(0, collLength(b));
    return Math.min.apply(Math,content);
}
function floatMax(b) {
    var content = unboxColl(b).slice(0, collLength(b));
    return Math.max.apply(Math,content);
}
function natOfFloat(v) {
    return boxNat(Math.trunc(v));
}
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

/* JavaScript runtime for core operators */

function isEnum(v) {
  if (v.$class) {
        return either(cast(["concerto.Enum"],v));
    } else {
        return false;
    }
}
function toString(v) {
    return toStringQ(v, "\"");
}
function toText(v) {
    return toTextQ(v, "\"");
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
    if(dayjs.isDayjs(v)) {
        return v.format('MM/DD/YYYY');
    }
    if(v.hasOwnProperty('$nat')){
        return "" + v.$nat;
    }
    if (isEnum(v)) {
        var enumval = v.$data;
        while (!enumval.$left) {
            enumval = enumval.$right;
        }
        return "" + enumval.$left
    }
    var result2 = "{";
    var first = true;
    for (var key in v) {
        if (first) first = false; else result2 += ", ";
        result2 += toStringQ(key, quote) + ": " + toStringQ(v[key], quote);
    }
    result2 += "}";
    return result2;
}
function toTextQ(v, quote) {
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
        var result = "";
        for (var i=0, n=v.length; i<n; i++) {
            if (i > 0)
                result += "";
          result += toTextQ(v[i], quote);
        }
        return result + "";
    }
    if (dayjs.isDayjs(v)) {
        return v.format('MM/DD/YYYY');
    }
    if(v.hasOwnProperty('$nat')){
        return "" + v.$nat;
    }
    if (isEnum(v)) {
        var enumval = v.$data;
        while (!enumval.$left) {
            enumval = enumval.$right;
        }
        return "" + enumval.$left
    }
    var result2 = "";
    var first = true;
    for (var key in v) {
        if (key !== "$class") {
            if (first) first = false; else result2 += " ";
            result2 += toTextQ(v[key], quote);
        }
    }
    return result2;
}
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

/* JavaScript runtime for DateTime component */

/* Utilities */
var SECONDS = "second";
var MINUTES = "minute";
var HOURS = "hour";
var DAYS = "day";
var WEEKS = "week";
var MONTHS = "month";
var QUARTERS = "quarter";
var YEARS = "year";

function mustBeDate(date) {
    return dayjs(date).utc().utcOffset(utcOffset);
}
function mustBeDateArray(dateArray) {
	  dateArray = unboxColl(dateArray).slice(0, collLength(dateArray));
    var newDateArray = [];
    for (var i=0; i<dateArray.length; i++) {
        newDateArray.push(mustBeDate(dateArray[i]));
    }
    return newDateArray;
}
function mustBeDuration(d) {
    if (typeof d === 'string') {
        return dayjs.duration(d);
    } else {
        return d;
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

/* DateTime */
function dateTimeGetSeconds(date) {
    date = mustBeDate(date);
    return boxNat(date.second());
}
function dateTimeGetMinutes(date) {
    date = mustBeDate(date);
    return boxNat(date.minute());
}
function dateTimeGetHours(date) {
    date = mustBeDate(date);
    return boxNat(date.hour());
}
function dateTimeGetDays(date) {
    date = mustBeDate(date);
    return boxNat(date.date());
}
function dateTimeGetWeeks(date) {
    date = mustBeDate(date);
    return boxNat(date.week());
}
function dateTimeGetMonths(date) {
    date = mustBeDate(date);
    return boxNat(date.month() + 1);
}
function dateTimeGetQuarters(date) {
    date = mustBeDate(date);
    return boxNat(date.quarter());
}
function dateTimeGetYears(date) {
    date = mustBeDate(date);
    return boxNat(date.year());
}

function dateTimeStartOfDay(date) {
    date = mustBeDate(date);
    return date.startOf('day');
}
function dateTimeStartOfWeek(date) {
    date = mustBeDate(date);
    return date.startOf('week');
}
function dateTimeStartOfMonth(date) {
    date = mustBeDate(date);
    return date.startOf('month');
}
function dateTimeStartOfQuarter(date) {
    date = mustBeDate(date);
    return date.startOf('quarter');
}
function dateTimeStartOfYear(date) {
    date = mustBeDate(date);
    return date.startOf('year');
}

function dateTimeEndOfDay(date) {
    date = mustBeDate(date);
    return date.endOf('day');
}
function dateTimeEndOfWeek(date) {
    date = mustBeDate(date);
    return date.endOf('week');
}
function dateTimeEndOfMonth(date) {
    date = mustBeDate(date);
    return date.endOf('month');
}
function dateTimeEndOfQuarter(date) {
    date = mustBeDate(date);
    return date.endOf('quarter');
}
function dateTimeEndOfYear(date) {
    date = mustBeDate(date);
    return date.endOf('year');
}
/* DateTime Formating */
function dateTimeFormatFromString(s) {
  return s;
}
function dateTimeFromString(stringDate) {
    return dayjs(stringDate).utc().utcOffset(utcOffset);
}

const minDateTime = dayjs.utc('0001-01-01T00:00:00Z');
const maxDateTime = dayjs.utc('3268-01-21T23:59:59Z');
function dateTimeMax(v) {
    var v1 = mustBeDateArray(v);
    if (v1.length === 0) {
        return minDateTime;
    } else {
        return dayjs.max(v1);
    }
}
function dateTimeMin(v) {
    var v1 = mustBeDateArray(v);
    if (v1.length === 0) {
        return maxDateTime;
    } else {
        return dayjs.min(v1);
    }
}

function dateTimeDurationAmount(v) {
    v = mustBeDuration(v);
    return boxNat(v.asSeconds());
}

function dateTimeDurationFromString(stringDuration) {
    // TODO verify what the string format for durations is going to be.
    // Here we assume a number adjoined to a valid unit with a dash.
    if (typeof stringDuration === "string") {
	      var parts = stringDuration.split("-");
	      if (parts.length === 2) {
	          mustBeUnit(parts[1]);
            return dayjs.duration(parseFloat(parts[0]),parts[1]+"s");
        }
    }
    throw new Error("Not well formed duration input: " + stringDuration);
}

function dateTimeDurationFromSeconds(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'second');
}
function dateTimeDurationFromMinutes(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'minute');
}
function dateTimeDurationFromHours(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'hour');
}
function dateTimeDurationFromDays(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'day');
}
function dateTimeDurationFromWeeks(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'week');
}

function dateTimePeriodFromString(stringDuration) {
    return dateTimeDurationFromString(stringDuration);
}
function dateTimePeriodFromDays(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'day');
}
function dateTimePeriodFromWeeks(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'week');
}
function dateTimePeriodFromMonths(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'month');
}
function dateTimePeriodFromQuarters(v) {
    var num = unboxNat(v);
    return dayjs.duration(num * 3,'month');
}
function dateTimePeriodFromYears(v) {
    var num = unboxNat(v);
    return dayjs.duration(num,'year');
}

function dateTimeFormat(date,f) {
  date = mustBeDate(date);
  return date.format(f);
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
    return dayjs.duration(date1.diff(date2,'seconds'),'seconds');
}
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

/* JavaScript runtime for Uri component */

function uriEncode(v) {
  return encodeURIComponent(v);
}

function uriDecode(v) {
  return decodeURIComponent(v);
}
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

/* Addendum to the Ergo runtime for the math library */

function floatOfString(s) {
    // Check whether we're dealing with nan, since it's the error case for Number.parseFloat
    if (s === 'nan') {
        return NaN;
    } else {
        let num = Number.parseFloat(s);
        if (Number.isNaN(num)) {
            return null;
        } else {
            return num
        }
    }
}
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

/* Addendum to the Ergo runtime for Loggingsupport */

/* Logging */
function logString(v) {
  logger.info(v);
}

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

/* Unwrapping errors on output */
function unwrapError(result) {
    if (result.hasOwnProperty('$left')) {
        return toLeft(result);
    } else {
        var failure = toRight(result);
        var message = "Unknown Ergo Logic Error (Please file a GitHub issue)";
        if (either(cast(["org.accordproject.ergo.stdlib.Error"],failure))) {
            message = unbrand(toLeft(cast(["org.accordproject.ergo.stdlib.Error"],failure))).message;
        } else {
            message = JSON.stringify(toRight(cast(["org.accordproject.ergo.stdlib.Error"],failure)));
        }
        throw new Error("[Ergo] " + message);
    }
}
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

/* Addendum to the Ergo runtime for monetary amount support */

function monetaryAmountFormat(v,f) {
    return f.replace(/0(.)0((.)(0+))?/gi, function(_a,sep1,_b,sep2,digits){
        const len = digits ? digits.length : 0;
        const vs = v.toFixed(len);
        let res = '';
        if (sep2) {
            const d = vs.substring(vs.length - len);
            res += sep2 + d;
        }
        let i = vs.substring(0,vs.length - (len === 0 ? 0 : len+1));
        while (i.length > 3) {
            res = sep1 + i.substring(i.length - 3) + res;
            i = i.substring(0, i.length - 3);
        }
        return i + res;
    });
}
function codeSymbol(c) {
    switch (c) {
    case 'USD' : return '$';
    case 'EUR' : return '€';
    case 'JPY' : return '¥';
    case 'GBP' : return '£';
    case 'AUD' : return 'A$';
    case 'CAD' : return 'C$';
    case 'CHF' : return 'CHF';
    case 'CNY' : return '元';
    case 'HKD' : return 'HK$';
    case 'NZD' : return 'NZ$';
    case 'KRW' : return '₩';
    case 'SGD' : return 'S$';
    case 'MXN' : return 'MEX$';
    case 'INR' : return '₹';
    case 'RUB' : return '₽';
    case 'ZAR' : return 'R';
    case 'TRY' : return '₺';
    case 'BRL' : return 'R$';
    case 'TWD' : return 'NT$';
    case 'PLN' : return 'zł';
    case 'THB' : return '฿';
    case 'IDR' : return 'Rp';
    case 'HUF' : return 'Ft';
    case 'CZK' : return 'Kč';
    case 'ILS' : return '₪';
    case 'CLP' : return 'CLP$';
    case 'PHP' : return '₱';
    case 'AED' : return 'د.إ';
    case 'COP' : return 'COL$';
    case 'SAR' : return '﷼';
    case 'MYR' : return 'RM';
    case 'RON' : return 'L';
    case 'BGN' : return 'лв.';
    default : return c; // Defaults to ISO code
    }
}
function monetaryCodeFormat(v,f) {
    const code = v.substring(v.length-3);
    return f.replace(/K/gi,codeSymbol(code)).replace(/CCC/gi,code);
}
