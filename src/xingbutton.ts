/*
 * Angular Directive "ngXingLogin"
 *
 * by Christian Pätzold
 * based on Angular 2 Directive by by Alexander Casall
 * see https://github.com/sialcasa/angular2-xingbutton
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

module App.Directives {
    "use strict";

    interface IXingAttributes extends ng.IAttributes {

        // configuration
        consumerKey: string;
        language: string;
        size: string;
        color: string;

        // methods
        onSuccess: string;
        onFailed: string;
    }

    interface IXingLoginResult {
        error: string;
        user: IXingUser;
    }

    export interface IXingUser {
        id: string,
        first_name: string,
        last_name: string,
        display_name: string,
        active_email: string,
        permalink: string,
        business_address: {
            street: string,
            city: string,
            province: string,
            country: string
        },
        photo_urls: {
            maxi_thumb: string,
        },
        professional_experience: {
            primary_company: {
                name: string,
                title: string,
                industry: string,
            }
        },
        error: string
    }

    app.directive("ngXingLogin", () => {
        return {
            restrict: "E",
            link: (
                $scope: ng.IScope,
                $element: ng.IAugmentedJQuery,
                $attrs: IXingAttributes) => {

                // --- private methods ----------------------------------------------------------------------------------------------------

                var renderXingLoginButton = () => {
                    let activationScript = document.createElement("script");
                    activationScript.text = `
                        (function (d) {
                            var js, id = "lwx";
                            if (d.getElementById(id)) return;
                            js = d.createElement("script"); js.id = id; js.src = "https://www.xing-share.com/plugins/login.js";
                            d.getElementsByTagName("ng-xing-login")[0].appendChild(js)
                        }(document));
                    `;
                    $element.append(activationScript);
                };

                var renderXingCallbackHandler = () => {
                    let callbackScript = document.createElement("script");
                    callbackScript.text = `function onXingAuthLogin(response) {
                        var output;
                        var event = new CustomEvent("xing-login-event", {
                            detail: {
                                error: response.error,
                                user: response.user
                            }
                        });
                        document.getElementsByTagName("ng-xing-login")[0].dispatchEvent(event);
                    }`;
                    $element.append(callbackScript);
                };

                var renderXingConfigParams = () => {
                    let consumerKey = document.createElement("script");
                    consumerKey.setAttribute("type", "xing/login");
                    consumerKey.text = `
                        {
                            "consumer_key": "` + $attrs.consumerKey + `",
                            "language": "` + $attrs.language + `",
                            "size": "` + $attrs.size + `",
                            "color": "` + $attrs.color + `"
                        }
                    `;
                    $element.append(consumerKey);
                };


                // --- Bindings -----------------------------------------------------------------------------------------------------------

                $element.on("xing-login-event", e => {
                    var detail = (e.originalEvent as any).detail as IXingLoginResult;

                    if (detail.error) {
                        $scope.$eval($attrs.onFailed, { $error: detail.error });
                    } else {
                        $scope.$eval($attrs.onSuccess, { $user: detail.user });
                    }
                });


                // --- Init ---------------------------------------------------------------------------------------------------------------

                renderXingConfigParams();
                renderXingCallbackHandler();
                renderXingLoginButton();
            }
        }
    });
}
