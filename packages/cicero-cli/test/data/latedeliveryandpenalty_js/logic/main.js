/* Generated using ergoc version 0.9.4 */
'use strict';
/*eslint-disable no-unused-vars*/
/*eslint-disable no-undef*/
/*eslint-disable no-var*/


/**
 * Execute the smart clause
 * @param {Context} context - the Accord context
 * @param {org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest} context.request - the incoming request
 * @param {org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse} context.response - the response
 * @param {org.accordproject.base.Event} context.emit - the emitted events
 * @param {org.accordproject.cicero.contract.AccordContractState} context.state - the state
 */
function orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty_latedeliveryandpenalty(context) {
  let pcontext = { 'request' : context.request, '__state': context.__state, '__contract': context.__contract, '__emit': context.__emit, '__now': context.__now, '__options': context.__options};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
  return new orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty().latedeliveryandpenalty(pcontext);
}
class orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty {
  main(context) {
    var vX__now = deref(context, "__now");
    var vX__5 = deref(context, "__contract");
    var vrequest = deref(context, "request");
    var vX__4 = deref(context, "__emit");
    var vX__3 = deref(context, "__state");
    var vX__2 = vX__3;
    var vX__1 = vX__4;
    var vX__0 = vX__5;
    var vX$match0_1 = vrequest;
    var res1 = null;
    if (either(cast(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"],vX$match0_1))) {
      var vX$case0 = null;
      vX$case0 = toLeft(cast(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"],vX$match0_1));
      res1 = {"left" : {"$main": vX$case0}};
    } else {
      var vX$case1 = null;
      vX$case1 = toRight(cast(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyRequest"],vX$match0_1));
      res1 = {"right" : null};
    }
    var res63 = null;
    if (either(res1)) {
      var vX$case0_4 = null;
      vX$case0_4 = toLeft(res1);
      var vX$case0_3 = vX$case0_4;
      var vX$main = deref(vX$case0_3, "$main");
      var vX__contract = vX__5;
      var vX__state = vX__2;
      var vX__emit = vX__1;
      var vrequest_0 = vX$main;
      var vX__lstate = vX__3;
      var vX__lemit = vX__4;
      var vX__this = vX__5;
      var vagreed = deref(unbrand(vrequest), "agreedDelivery");
      var vp1 = vagreed;
      var vp2 = vX__now;
      var t62;
      if (!(dateTimeIsBefore(vp1, vp2))) {
        t62 = {"right" : brand(["org.accordproject.ergo.stdlib.ErgoErrorResponse"],{"message": "Cannot exercise late delivery before delivery date"})};
      } else {
        var t61;
        if (!((!(deref(unbrand(vX__5), "forceMajeure")) || !(deref(unbrand(vrequest), "forceMajeure"))))) {
          t61 = {"left" : concat(concat({"__response": brand(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"penalty": 0.0}, {"buyerMayTerminate": true}))}, {"__state": vX__lstate}), {"__emit": vX__lemit})};
        } else {
          var vx = vX__now;
          var vy = vagreed;
          var vz = "days";
          var vp1$0 = vx;
          var vp2$0 = vy;
          var vdu = dateTimeDiff(vp1$0, vp2$0);
          var vp0 = vdu;
          var vdu$0 = brand(["org.accordproject.time.Duration"],concat({"unit": "seconds"}, {"amount": dateTimeDurationAmount(vp0)}));
          var vu = vz;
          var t60;
          if (equal(vu, deref(unbrand(vdu$0), "unit"))) {
            t60 = vdu$0;
          } else {
            var vX$match0_0 = vu;
            var t2;
            if (equal(vX$match0_0, "seconds")) {
              t2 = {"left" : {}};
            } else {
              t2 = {"right" : null};
            }
            var res59 = null;
            if (either(t2)) {
              var vX$case0_2 = null;
              vX$case0_2 = toLeft(t2);
              var vX$case0_1 = vX$case0_2;
              var vX$match0 = deref(unbrand(vdu$0), "unit");
              var t3;
              if (equal(vX$match0, "minutes")) {
                t3 = {"left" : {}};
              } else {
                t3 = {"right" : null};
              }
              var res10 = null;
              if (either(t3)) {
                var vX$case0_0 = null;
                vX$case0_0 = toLeft(t3);
                var vX$0 = vX$case0_0;
                res10 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
              } else {
                var vX$case1_2 = null;
                vX$case1_2 = toRight(t3);
                var t4;
                if (equal(vX$match0, "hours")) {
                  t4 = {"left" : {}};
                } else {
                  t4 = {"right" : null};
                }
                var res9 = null;
                if (either(t4)) {
                  var vX$1 = null;
                  vX$1 = toLeft(t4);
                  var vX$2 = vX$1;
                  res9 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                } else {
                  var vX$case1_1 = null;
                  vX$case1_1 = toRight(t4);
                  var t5;
                  if (equal(vX$match0, "days")) {
                    t5 = {"left" : {}};
                  } else {
                    t5 = {"right" : null};
                  }
                  var res8 = null;
                  if (either(t5)) {
                    var vX$3 = null;
                    vX$3 = toLeft(t5);
                    var vX$4 = vX$3;
                    res8 = natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                  } else {
                    var vX$case1_0 = null;
                    vX$case1_0 = toRight(t5);
                    var t6;
                    if (equal(vX$match0, "weeks")) {
                      t6 = {"left" : {}};
                    } else {
                      t6 = {"right" : null};
                    }
                    var res7 = null;
                    if (either(t6)) {
                      var vX$5 = null;
                      vX$5 = toLeft(t6);
                      var vX$6 = vX$5;
                      res7 = natMult(natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                    } else {
                      var vX$7 = null;
                      vX$7 = toRight(t6);
                      res7 = deref(unbrand(vdu$0), "amount");
                    }
                    res8 = res7;
                  }
                  res9 = res8;
                }
                res10 = res9;
              }
              res59 = res10;
            } else {
              var vX$case1_7 = null;
              vX$case1_7 = toRight(t2);
              var t11;
              if (equal(vX$match0_0, "minutes")) {
                t11 = {"left" : {}};
              } else {
                t11 = {"right" : null};
              }
              var res58 = null;
              if (either(t11)) {
                var vX$8 = null;
                vX$8 = toLeft(t11);
                var vX$9 = vX$8;
                var vX$A = deref(unbrand(vdu$0), "unit");
                var t12;
                if (equal(vX$A, "seconds")) {
                  t12 = {"left" : {}};
                } else {
                  t12 = {"right" : null};
                }
                var res19 = null;
                if (either(t12)) {
                  var vX$B = null;
                  vX$B = toLeft(t12);
                  var vX$C = vX$B;
                  res19 = natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                } else {
                  var vX$D = null;
                  vX$D = toRight(t12);
                  var t13;
                  if (equal(vX$A, "hours")) {
                    t13 = {"left" : {}};
                  } else {
                    t13 = {"right" : null};
                  }
                  var res18 = null;
                  if (either(t13)) {
                    var vX$E = null;
                    vX$E = toLeft(t13);
                    var vX$F = vX$E;
                    res18 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                  } else {
                    var vX$10 = null;
                    vX$10 = toRight(t13);
                    var t14;
                    if (equal(vX$A, "days")) {
                      t14 = {"left" : {}};
                    } else {
                      t14 = {"right" : null};
                    }
                    var res17 = null;
                    if (either(t14)) {
                      var vX$11 = null;
                      vX$11 = toLeft(t14);
                      var vX$12 = vX$11;
                      res17 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0});
                    } else {
                      var vX$13 = null;
                      vX$13 = toRight(t14);
                      var t15;
                      if (equal(vX$A, "weeks")) {
                        t15 = {"left" : {}};
                      } else {
                        t15 = {"right" : null};
                      }
                      var res16 = null;
                      if (either(t15)) {
                        var vX$14 = null;
                        vX$14 = toLeft(t15);
                        var vX$15 = vX$14;
                        res16 = natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                      } else {
                        var vX$16 = null;
                        vX$16 = toRight(t15);
                        res16 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                      }
                      res17 = res16;
                    }
                    res18 = res17;
                  }
                  res19 = res18;
                }
                res58 = res19;
              } else {
                var vX$case1_6 = null;
                vX$case1_6 = toRight(t11);
                var t20;
                if (equal(vX$match0_0, "hours")) {
                  t20 = {"left" : {}};
                } else {
                  t20 = {"right" : null};
                }
                var res57 = null;
                if (either(t20)) {
                  var vX$17 = null;
                  vX$17 = toLeft(t20);
                  var vX$18 = vX$17;
                  var vX$19 = deref(unbrand(vdu$0), "unit");
                  var t21;
                  if (equal(vX$19, "seconds")) {
                    t21 = {"left" : {}};
                  } else {
                    t21 = {"right" : null};
                  }
                  var res28 = null;
                  if (either(t21)) {
                    var vX$1A = null;
                    vX$1A = toLeft(t21);
                    var vX$1B = vX$1A;
                    res28 = natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                  } else {
                    var vX$1C = null;
                    vX$1C = toRight(t21);
                    var t22;
                    if (equal(vX$19, "minutes")) {
                      t22 = {"left" : {}};
                    } else {
                      t22 = {"right" : null};
                    }
                    var res27 = null;
                    if (either(t22)) {
                      var vX$1D = null;
                      vX$1D = toLeft(t22);
                      var vX$1E = vX$1D;
                      res27 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                    } else {
                      var vX$1F = null;
                      vX$1F = toRight(t22);
                      var t23;
                      if (equal(vX$19, "days")) {
                        t23 = {"left" : {}};
                      } else {
                        t23 = {"right" : null};
                      }
                      var res26 = null;
                      if (either(t23)) {
                        var vX$20 = null;
                        vX$20 = toLeft(t23);
                        var vX$21 = vX$20;
                        res26 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 24.0});
                      } else {
                        var vX$22 = null;
                        vX$22 = toRight(t23);
                        var t24;
                        if (equal(vX$19, "weeks")) {
                          t24 = {"left" : {}};
                        } else {
                          t24 = {"right" : null};
                        }
                        var res25 = null;
                        if (either(t24)) {
                          var vX$23 = null;
                          vX$23 = toLeft(t24);
                          var vX$24 = vX$23;
                          res25 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 24.0}), {"nat": 7.0});
                        } else {
                          var vX$25 = null;
                          vX$25 = toRight(t24);
                          res25 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                        }
                        res26 = res25;
                      }
                      res27 = res26;
                    }
                    res28 = res27;
                  }
                  res57 = res28;
                } else {
                  var vX$case1_5 = null;
                  vX$case1_5 = toRight(t20);
                  var t29;
                  if (equal(vX$match0_0, "days")) {
                    t29 = {"left" : {}};
                  } else {
                    t29 = {"right" : null};
                  }
                  var res56 = null;
                  if (either(t29)) {
                    var vX$26 = null;
                    vX$26 = toLeft(t29);
                    var vX$27 = vX$26;
                    var vX$28 = deref(unbrand(vdu$0), "unit");
                    var t30;
                    if (equal(vX$28, "seconds")) {
                      t30 = {"left" : {}};
                    } else {
                      t30 = {"right" : null};
                    }
                    var res37 = null;
                    if (either(t30)) {
                      var vX$29 = null;
                      vX$29 = toLeft(t30);
                      var vX$2A = vX$29;
                      res37 = natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                    } else {
                      var vX$2B = null;
                      vX$2B = toRight(t30);
                      var t31;
                      if (equal(vX$28, "minutes")) {
                        t31 = {"left" : {}};
                      } else {
                        t31 = {"right" : null};
                      }
                      var res36 = null;
                      if (either(t31)) {
                        var vX$2C = null;
                        vX$2C = toLeft(t31);
                        var vX$2D = vX$2C;
                        res36 = natDiv(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0});
                      } else {
                        var vX$2E = null;
                        vX$2E = toRight(t31);
                        var t32;
                        if (equal(vX$28, "hours")) {
                          t32 = {"left" : {}};
                        } else {
                          t32 = {"right" : null};
                        }
                        var res35 = null;
                        if (either(t32)) {
                          var vX$2F = null;
                          vX$2F = toLeft(t32);
                          var vX$30 = vX$2F;
                          res35 = natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 24.0});
                        } else {
                          var vX$31 = null;
                          vX$31 = toRight(t32);
                          var t33;
                          if (equal(vX$28, "weeks")) {
                            t33 = {"left" : {}};
                          } else {
                            t33 = {"right" : null};
                          }
                          var res34 = null;
                          if (either(t33)) {
                            var vX$32 = null;
                            vX$32 = toLeft(t33);
                            var vX$33 = vX$32;
                            res34 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 7.0});
                          } else {
                            var vX$34 = null;
                            vX$34 = toRight(t33);
                            res34 = natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                          }
                          res35 = res34;
                        }
                        res36 = res35;
                      }
                      res37 = res36;
                    }
                    res56 = res37;
                  } else {
                    var vX$case1_4 = null;
                    vX$case1_4 = toRight(t29);
                    var t38;
                    if (equal(vX$match0_0, "weeks")) {
                      t38 = {"left" : {}};
                    } else {
                      t38 = {"right" : null};
                    }
                    var res55 = null;
                    if (either(t38)) {
                      var vX$35 = null;
                      vX$35 = toLeft(t38);
                      var vX$36 = vX$35;
                      var vX$37 = deref(unbrand(vdu$0), "unit");
                      var t39;
                      if (equal(vX$37, "seconds")) {
                        t39 = {"left" : {}};
                      } else {
                        t39 = {"right" : null};
                      }
                      var res46 = null;
                      if (either(t39)) {
                        var vX$38 = null;
                        vX$38 = toLeft(t39);
                        var vX$39 = vX$38;
                        res46 = natDiv(natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                      } else {
                        var vX$3A = null;
                        vX$3A = toRight(t39);
                        var t40;
                        if (equal(vX$37, "minutes")) {
                          t40 = {"left" : {}};
                        } else {
                          t40 = {"right" : null};
                        }
                        var res45 = null;
                        if (either(t40)) {
                          var vX$3B = null;
                          vX$3B = toLeft(t40);
                          var vX$3C = vX$3B;
                          res45 = natDiv(natDiv(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                        } else {
                          var vX$3D = null;
                          vX$3D = toRight(t40);
                          var t41;
                          if (equal(vX$37, "hours")) {
                            t41 = {"left" : {}};
                          } else {
                            t41 = {"right" : null};
                          }
                          var res44 = null;
                          if (either(t41)) {
                            var vX$3E = null;
                            vX$3E = toLeft(t41);
                            var vX$3F = vX$3E;
                            res44 = natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 24.0}), {"nat": 7.0});
                          } else {
                            var vX$40 = null;
                            vX$40 = toRight(t41);
                            var t42;
                            if (equal(vX$37, "days")) {
                              t42 = {"left" : {}};
                            } else {
                              t42 = {"right" : null};
                            }
                            var res43 = null;
                            if (either(t42)) {
                              var vX$41 = null;
                              vX$41 = toLeft(t42);
                              var vX$42 = vX$41;
                              res43 = natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 7.0});
                            } else {
                              var vX$43 = null;
                              vX$43 = toRight(t42);
                              res43 = natDiv(natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                            }
                            res44 = res43;
                          }
                          res45 = res44;
                        }
                        res46 = res45;
                      }
                      res55 = res46;
                    } else {
                      var vX$case1_3 = null;
                      vX$case1_3 = toRight(t38);
                      var vX$44 = deref(unbrand(vdu$0), "unit");
                      var t47;
                      if (equal(vX$44, "minutes")) {
                        t47 = {"left" : {}};
                      } else {
                        t47 = {"right" : null};
                      }
                      var res54 = null;
                      if (either(t47)) {
                        var vX$45 = null;
                        vX$45 = toLeft(t47);
                        var vX$46 = vX$45;
                        res54 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                      } else {
                        var vX$47 = null;
                        vX$47 = toRight(t47);
                        var t48;
                        if (equal(vX$44, "hours")) {
                          t48 = {"left" : {}};
                        } else {
                          t48 = {"right" : null};
                        }
                        var res53 = null;
                        if (either(t48)) {
                          var vX$48 = null;
                          vX$48 = toLeft(t48);
                          var vX$49 = vX$48;
                          res53 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                        } else {
                          var vX$4A = null;
                          vX$4A = toRight(t48);
                          var t49;
                          if (equal(vX$44, "days")) {
                            t49 = {"left" : {}};
                          } else {
                            t49 = {"right" : null};
                          }
                          var res52 = null;
                          if (either(t49)) {
                            var vX$4B = null;
                            vX$4B = toLeft(t49);
                            var vX$4C = vX$4B;
                            res52 = natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                          } else {
                            var vX$4D = null;
                            vX$4D = toRight(t49);
                            var t50;
                            if (equal(vX$44, "week")) {
                              t50 = {"left" : {}};
                            } else {
                              t50 = {"right" : null};
                            }
                            var res51 = null;
                            if (either(t50)) {
                              var vX$4E = null;
                              vX$4E = toLeft(t50);
                              var vX$4F = vX$4E;
                              res51 = natMult(natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                            } else {
                              var vX$50 = null;
                              vX$50 = toRight(t50);
                              res51 = deref(unbrand(vdu$0), "amount");
                            }
                            res52 = res51;
                          }
                          res53 = res52;
                        }
                        res54 = res53;
                      }
                      res55 = res54;
                    }
                    res56 = res55;
                  }
                  res57 = res56;
                }
                res58 = res57;
              }
              res59 = res58;
            }
            var vamount = res59;
            t60 = brand(["org.accordproject.time.Duration"],concat({"unit": vu}, {"amount": vamount}));
          }
          var vdiff = deref(unbrand(t60), "amount");
          var vp0$0 = vdiff;
          var vp0$1 = deref(unbrand(deref(unbrand(vX__5), "penaltyDuration")), "amount");
          var vpenalty = ((((floatOfNat(vp0$0) / floatOfNat(vp0$1)) * deref(unbrand(vX__5), "penaltyPercentage")) / 100.0) * deref(unbrand(vrequest), "goodsValue"));
          var vp0$2 = bunion([vpenalty], [((deref(unbrand(vX__5), "capPercentage") * deref(unbrand(vrequest), "goodsValue")) / 100.0)]);
          var vcapped = Math.min.apply(Math,vp0$2);
          t61 = {"left" : concat(concat({"__response": brand(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"penalty": vcapped}, {"buyerMayTerminate": !((compare(vdiff,deref(unbrand(deref(unbrand(vX__5), "termination")), "amount")) <= 0))}))}, {"__state": vX__lstate}), {"__emit": vX__lemit})};
        }
        t62 = t61;
      }
      res63 = t62;
    } else {
      var vX$51 = null;
      vX$51 = toRight(res1);
      res63 = {"right" : {"type": ["org.accordproject.ergo.stdlib.ErgoErrorResponse"], "data": {"message": "Dispatch Error: no clause in the contract matches the request"}}};
    }
    return res63;
  }
  init(context) {
    var vX__contract = deref(context, "__contract");
    var vX__emit = deref(context, "__emit");
    var vX__state = deref(context, "__state");
    var vX__0 = vX__state;
    var vX__lemit = vX__emit;
    var vX__this = vX__contract;
    var vX__lstate = brand(["org.accordproject.cicero.contract.AccordContractState"],{"stateId": "org.accordproject.cicero.contract.AccordContractState#1"});
    return {"left" : concat(concat({"__response": null}, {"__state": vX__lstate}), {"__emit": vX__lemit})};
  }
  latedeliveryandpenalty(context) {
    var vX__contract = deref(context, "__contract");
    var vrequest = deref(context, "request");
    var vX__now = deref(context, "__now");
    var vX__emit = deref(context, "__emit");
    var vX__state = deref(context, "__state");
    var vX__lstate = vX__state;
    var vX__lemit = vX__emit;
    var vX__this = vX__contract;
    var vagreed = deref(unbrand(vrequest), "agreedDelivery");
    var vp1 = vagreed;
    var vp2 = vX__now;
    var t61;
    if (!(dateTimeIsBefore(vp1, vp2))) {
      t61 = {"right" : brand(["org.accordproject.ergo.stdlib.ErgoErrorResponse"],{"message": "Cannot exercise late delivery before delivery date"})};
    } else {
      var t60;
      if (!((!(deref(unbrand(vX__contract), "forceMajeure")) || !(deref(unbrand(vrequest), "forceMajeure"))))) {
        t60 = {"left" : concat(concat({"__response": brand(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"penalty": 0.0}, {"buyerMayTerminate": true}))}, {"__state": vX__lstate}), {"__emit": vX__lemit})};
      } else {
        var vx = vX__now;
        var vy = vagreed;
        var vz = "days";
        var vp1$0 = vx;
        var vp2$0 = vy;
        var vdu = dateTimeDiff(vp1$0, vp2$0);
        var vp0 = vdu;
        var vdu$0 = brand(["org.accordproject.time.Duration"],concat({"unit": "seconds"}, {"amount": dateTimeDurationAmount(vp0)}));
        var vu = vz;
        var t59;
        if (equal(vu, deref(unbrand(vdu$0), "unit"))) {
          t59 = vdu$0;
        } else {
          var vX$match0_0 = vu;
          var t1;
          if (equal(vX$match0_0, "seconds")) {
            t1 = {"left" : {}};
          } else {
            t1 = {"right" : null};
          }
          var res58 = null;
          if (either(t1)) {
            var vX$case0_2 = null;
            vX$case0_2 = toLeft(t1);
            var vX$case0_1 = vX$case0_2;
            var vX$match0 = deref(unbrand(vdu$0), "unit");
            var t2;
            if (equal(vX$match0, "minutes")) {
              t2 = {"left" : {}};
            } else {
              t2 = {"right" : null};
            }
            var res9 = null;
            if (either(t2)) {
              var vX$case0_0 = null;
              vX$case0_0 = toLeft(t2);
              var vX$case0 = vX$case0_0;
              res9 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
            } else {
              var vX$case1_2 = null;
              vX$case1_2 = toRight(t2);
              var t3;
              if (equal(vX$match0, "hours")) {
                t3 = {"left" : {}};
              } else {
                t3 = {"right" : null};
              }
              var res8 = null;
              if (either(t3)) {
                var vX$0 = null;
                vX$0 = toLeft(t3);
                var vX$1 = vX$0;
                res8 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
              } else {
                var vX$case1_1 = null;
                vX$case1_1 = toRight(t3);
                var t4;
                if (equal(vX$match0, "days")) {
                  t4 = {"left" : {}};
                } else {
                  t4 = {"right" : null};
                }
                var res7 = null;
                if (either(t4)) {
                  var vX$2 = null;
                  vX$2 = toLeft(t4);
                  var vX$3 = vX$2;
                  res7 = natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                } else {
                  var vX$case1_0 = null;
                  vX$case1_0 = toRight(t4);
                  var t5;
                  if (equal(vX$match0, "weeks")) {
                    t5 = {"left" : {}};
                  } else {
                    t5 = {"right" : null};
                  }
                  var res6 = null;
                  if (either(t5)) {
                    var vX$4 = null;
                    vX$4 = toLeft(t5);
                    var vX$5 = vX$4;
                    res6 = natMult(natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                  } else {
                    var vX$case1 = null;
                    vX$case1 = toRight(t5);
                    res6 = deref(unbrand(vdu$0), "amount");
                  }
                  res7 = res6;
                }
                res8 = res7;
              }
              res9 = res8;
            }
            res58 = res9;
          } else {
            var vX$case1_7 = null;
            vX$case1_7 = toRight(t1);
            var t10;
            if (equal(vX$match0_0, "minutes")) {
              t10 = {"left" : {}};
            } else {
              t10 = {"right" : null};
            }
            var res57 = null;
            if (either(t10)) {
              var vX$6 = null;
              vX$6 = toLeft(t10);
              var vX$7 = vX$6;
              var vX$8 = deref(unbrand(vdu$0), "unit");
              var t11;
              if (equal(vX$8, "seconds")) {
                t11 = {"left" : {}};
              } else {
                t11 = {"right" : null};
              }
              var res18 = null;
              if (either(t11)) {
                var vX$9 = null;
                vX$9 = toLeft(t11);
                var vX$A = vX$9;
                res18 = natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
              } else {
                var vX$B = null;
                vX$B = toRight(t11);
                var t12;
                if (equal(vX$8, "hours")) {
                  t12 = {"left" : {}};
                } else {
                  t12 = {"right" : null};
                }
                var res17 = null;
                if (either(t12)) {
                  var vX$C = null;
                  vX$C = toLeft(t12);
                  var vX$D = vX$C;
                  res17 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                } else {
                  var vX$E = null;
                  vX$E = toRight(t12);
                  var t13;
                  if (equal(vX$8, "days")) {
                    t13 = {"left" : {}};
                  } else {
                    t13 = {"right" : null};
                  }
                  var res16 = null;
                  if (either(t13)) {
                    var vX$F = null;
                    vX$F = toLeft(t13);
                    var vX$10 = vX$F;
                    res16 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0});
                  } else {
                    var vX$11 = null;
                    vX$11 = toRight(t13);
                    var t14;
                    if (equal(vX$8, "weeks")) {
                      t14 = {"left" : {}};
                    } else {
                      t14 = {"right" : null};
                    }
                    var res15 = null;
                    if (either(t14)) {
                      var vX$12 = null;
                      vX$12 = toLeft(t14);
                      var vX$13 = vX$12;
                      res15 = natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                    } else {
                      var vX$14 = null;
                      vX$14 = toRight(t14);
                      res15 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                    }
                    res16 = res15;
                  }
                  res17 = res16;
                }
                res18 = res17;
              }
              res57 = res18;
            } else {
              var vX$case1_6 = null;
              vX$case1_6 = toRight(t10);
              var t19;
              if (equal(vX$match0_0, "hours")) {
                t19 = {"left" : {}};
              } else {
                t19 = {"right" : null};
              }
              var res56 = null;
              if (either(t19)) {
                var vX$15 = null;
                vX$15 = toLeft(t19);
                var vX$16 = vX$15;
                var vX$17 = deref(unbrand(vdu$0), "unit");
                var t20;
                if (equal(vX$17, "seconds")) {
                  t20 = {"left" : {}};
                } else {
                  t20 = {"right" : null};
                }
                var res27 = null;
                if (either(t20)) {
                  var vX$18 = null;
                  vX$18 = toLeft(t20);
                  var vX$19 = vX$18;
                  res27 = natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                } else {
                  var vX$1A = null;
                  vX$1A = toRight(t20);
                  var t21;
                  if (equal(vX$17, "minutes")) {
                    t21 = {"left" : {}};
                  } else {
                    t21 = {"right" : null};
                  }
                  var res26 = null;
                  if (either(t21)) {
                    var vX$1B = null;
                    vX$1B = toLeft(t21);
                    var vX$1C = vX$1B;
                    res26 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                  } else {
                    var vX$1D = null;
                    vX$1D = toRight(t21);
                    var t22;
                    if (equal(vX$17, "days")) {
                      t22 = {"left" : {}};
                    } else {
                      t22 = {"right" : null};
                    }
                    var res25 = null;
                    if (either(t22)) {
                      var vX$1E = null;
                      vX$1E = toLeft(t22);
                      var vX$1F = vX$1E;
                      res25 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 24.0});
                    } else {
                      var vX$20 = null;
                      vX$20 = toRight(t22);
                      var t23;
                      if (equal(vX$17, "weeks")) {
                        t23 = {"left" : {}};
                      } else {
                        t23 = {"right" : null};
                      }
                      var res24 = null;
                      if (either(t23)) {
                        var vX$21 = null;
                        vX$21 = toLeft(t23);
                        var vX$22 = vX$21;
                        res24 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 24.0}), {"nat": 7.0});
                      } else {
                        var vX$23 = null;
                        vX$23 = toRight(t23);
                        res24 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                      }
                      res25 = res24;
                    }
                    res26 = res25;
                  }
                  res27 = res26;
                }
                res56 = res27;
              } else {
                var vX$case1_5 = null;
                vX$case1_5 = toRight(t19);
                var t28;
                if (equal(vX$match0_0, "days")) {
                  t28 = {"left" : {}};
                } else {
                  t28 = {"right" : null};
                }
                var res55 = null;
                if (either(t28)) {
                  var vX$24 = null;
                  vX$24 = toLeft(t28);
                  var vX$25 = vX$24;
                  var vX$26 = deref(unbrand(vdu$0), "unit");
                  var t29;
                  if (equal(vX$26, "seconds")) {
                    t29 = {"left" : {}};
                  } else {
                    t29 = {"right" : null};
                  }
                  var res36 = null;
                  if (either(t29)) {
                    var vX$27 = null;
                    vX$27 = toLeft(t29);
                    var vX$28 = vX$27;
                    res36 = natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                  } else {
                    var vX$29 = null;
                    vX$29 = toRight(t29);
                    var t30;
                    if (equal(vX$26, "minutes")) {
                      t30 = {"left" : {}};
                    } else {
                      t30 = {"right" : null};
                    }
                    var res35 = null;
                    if (either(t30)) {
                      var vX$2A = null;
                      vX$2A = toLeft(t30);
                      var vX$2B = vX$2A;
                      res35 = natDiv(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0});
                    } else {
                      var vX$2C = null;
                      vX$2C = toRight(t30);
                      var t31;
                      if (equal(vX$26, "hours")) {
                        t31 = {"left" : {}};
                      } else {
                        t31 = {"right" : null};
                      }
                      var res34 = null;
                      if (either(t31)) {
                        var vX$2D = null;
                        vX$2D = toLeft(t31);
                        var vX$2E = vX$2D;
                        res34 = natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 24.0});
                      } else {
                        var vX$2F = null;
                        vX$2F = toRight(t31);
                        var t32;
                        if (equal(vX$26, "weeks")) {
                          t32 = {"left" : {}};
                        } else {
                          t32 = {"right" : null};
                        }
                        var res33 = null;
                        if (either(t32)) {
                          var vX$30 = null;
                          vX$30 = toLeft(t32);
                          var vX$31 = vX$30;
                          res33 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 7.0});
                        } else {
                          var vX$32 = null;
                          vX$32 = toRight(t32);
                          res33 = natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                        }
                        res34 = res33;
                      }
                      res35 = res34;
                    }
                    res36 = res35;
                  }
                  res55 = res36;
                } else {
                  var vX$case1_4 = null;
                  vX$case1_4 = toRight(t28);
                  var t37;
                  if (equal(vX$match0_0, "weeks")) {
                    t37 = {"left" : {}};
                  } else {
                    t37 = {"right" : null};
                  }
                  var res54 = null;
                  if (either(t37)) {
                    var vX$33 = null;
                    vX$33 = toLeft(t37);
                    var vX$34 = vX$33;
                    var vX$35 = deref(unbrand(vdu$0), "unit");
                    var t38;
                    if (equal(vX$35, "seconds")) {
                      t38 = {"left" : {}};
                    } else {
                      t38 = {"right" : null};
                    }
                    var res45 = null;
                    if (either(t38)) {
                      var vX$36 = null;
                      vX$36 = toLeft(t38);
                      var vX$37 = vX$36;
                      res45 = natDiv(natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                    } else {
                      var vX$38 = null;
                      vX$38 = toRight(t38);
                      var t39;
                      if (equal(vX$35, "minutes")) {
                        t39 = {"left" : {}};
                      } else {
                        t39 = {"right" : null};
                      }
                      var res44 = null;
                      if (either(t39)) {
                        var vX$39 = null;
                        vX$39 = toLeft(t39);
                        var vX$3A = vX$39;
                        res44 = natDiv(natDiv(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                      } else {
                        var vX$3B = null;
                        vX$3B = toRight(t39);
                        var t40;
                        if (equal(vX$35, "hours")) {
                          t40 = {"left" : {}};
                        } else {
                          t40 = {"right" : null};
                        }
                        var res43 = null;
                        if (either(t40)) {
                          var vX$3C = null;
                          vX$3C = toLeft(t40);
                          var vX$3D = vX$3C;
                          res43 = natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 24.0}), {"nat": 7.0});
                        } else {
                          var vX$3E = null;
                          vX$3E = toRight(t40);
                          var t41;
                          if (equal(vX$35, "days")) {
                            t41 = {"left" : {}};
                          } else {
                            t41 = {"right" : null};
                          }
                          var res42 = null;
                          if (either(t41)) {
                            var vX$3F = null;
                            vX$3F = toLeft(t41);
                            var vX$40 = vX$3F;
                            res42 = natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 7.0});
                          } else {
                            var vX$41 = null;
                            vX$41 = toRight(t41);
                            res42 = natDiv(natDiv(natDiv(natDiv(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                          }
                          res43 = res42;
                        }
                        res44 = res43;
                      }
                      res45 = res44;
                    }
                    res54 = res45;
                  } else {
                    var vX$case1_3 = null;
                    vX$case1_3 = toRight(t37);
                    var vX$42 = deref(unbrand(vdu$0), "unit");
                    var t46;
                    if (equal(vX$42, "minutes")) {
                      t46 = {"left" : {}};
                    } else {
                      t46 = {"right" : null};
                    }
                    var res53 = null;
                    if (either(t46)) {
                      var vX$43 = null;
                      vX$43 = toLeft(t46);
                      var vX$44 = vX$43;
                      res53 = natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0});
                    } else {
                      var vX$45 = null;
                      vX$45 = toRight(t46);
                      var t47;
                      if (equal(vX$42, "hours")) {
                        t47 = {"left" : {}};
                      } else {
                        t47 = {"right" : null};
                      }
                      var res52 = null;
                      if (either(t47)) {
                        var vX$46 = null;
                        vX$46 = toLeft(t47);
                        var vX$47 = vX$46;
                        res52 = natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0});
                      } else {
                        var vX$48 = null;
                        vX$48 = toRight(t47);
                        var t48;
                        if (equal(vX$42, "days")) {
                          t48 = {"left" : {}};
                        } else {
                          t48 = {"right" : null};
                        }
                        var res51 = null;
                        if (either(t48)) {
                          var vX$49 = null;
                          vX$49 = toLeft(t48);
                          var vX$4A = vX$49;
                          res51 = natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0});
                        } else {
                          var vX$4B = null;
                          vX$4B = toRight(t48);
                          var t49;
                          if (equal(vX$42, "week")) {
                            t49 = {"left" : {}};
                          } else {
                            t49 = {"right" : null};
                          }
                          var res50 = null;
                          if (either(t49)) {
                            var vX$4C = null;
                            vX$4C = toLeft(t49);
                            var vX$4D = vX$4C;
                            res50 = natMult(natMult(natMult(natMult(deref(unbrand(vdu$0), "amount"), {"nat": 60.0}), {"nat": 60.0}), {"nat": 24.0}), {"nat": 7.0});
                          } else {
                            var vX$4E = null;
                            vX$4E = toRight(t49);
                            res50 = deref(unbrand(vdu$0), "amount");
                          }
                          res51 = res50;
                        }
                        res52 = res51;
                      }
                      res53 = res52;
                    }
                    res54 = res53;
                  }
                  res55 = res54;
                }
                res56 = res55;
              }
              res57 = res56;
            }
            res58 = res57;
          }
          var vamount = res58;
          t59 = brand(["org.accordproject.time.Duration"],concat({"unit": vu}, {"amount": vamount}));
        }
        var vdiff = deref(unbrand(t59), "amount");
        var vp0$0 = vdiff;
        var vp0$1 = deref(unbrand(deref(unbrand(vX__contract), "penaltyDuration")), "amount");
        var vpenalty = ((((floatOfNat(vp0$0) / floatOfNat(vp0$1)) * deref(unbrand(vX__contract), "penaltyPercentage")) / 100.0) * deref(unbrand(vrequest), "goodsValue"));
        var vp0$2 = bunion([vpenalty], [((deref(unbrand(vX__contract), "capPercentage") * deref(unbrand(vrequest), "goodsValue")) / 100.0)]);
        var vcapped = Math.min.apply(Math,vp0$2);
        t60 = {"left" : concat(concat({"__response": brand(["org.accordproject.latedeliveryandpenalty.LateDeliveryAndPenaltyResponse"],concat({"penalty": vcapped}, {"buyerMayTerminate": !((compare(vdiff,deref(unbrand(deref(unbrand(vX__contract), "termination")), "amount")) <= 0))}))}, {"__state": vX__lstate}), {"__emit": vX__lemit})};
      }
      t61 = t60;
    }
    return t61;
  }
}
const contract = new orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty();
function __dispatch(context) {
  let pcontext = { 'request' : context.request, '__state': context.__state, '__contract': context.__contract, '__emit': context.__emit, '__now': context.__now, '__options': context.__options};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
  return new orgXaccordprojectXlatedeliveryandpenaltyXLateDeliveryAndPenalty().main(pcontext);
}
function __init(context) {
  let pcontext = { 'state': { '$class': 'org.accordproject.cicero.contract.AccordContractState', 'stateId' : 'org.accordproject.cicero.contract.AccordContractState#1' }, '__contract': context.__contract, '__emit': context.__emit, '__now': context.__now, '__options': context.__options};
  //logger.info('ergo context: '+JSON.stringify(pcontext))
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
        return v[0];
    } else {
        return null; /* Not a singleton */
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
        return date.month() + 1; // Shift by one to get 1-12 range on months (Moment uses 0-11)
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
    } else if (date instanceof Date) {
        return moment(date).utcOffset(utcOffset, false);
    } else {
        return date.clone().utcOffset(utcOffset, false);;
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

