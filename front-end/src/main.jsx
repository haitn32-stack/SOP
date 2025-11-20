import React, {StrictMode} from 'react'
import {createRoot} from 'react-dom/client'
import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import {GoogleOAuthProvider} from "@react-oauth/google";
import {Provider} from "react-redux";
import {store} from './store/store';
import {DevSupport} from "@react-buddy/ide-toolbox";
import {ComponentPreviews, useInitial} from "./dev/index.js";

const CLIENT_ID = "448185679697-i0u6uvb3rkn6bqsg6tumiu9hosm5ibna.apps.googleusercontent.com"

createRoot(document.getElementById('root')).render(
    <StrictMode>
        <Provider store={store}>
            <GoogleOAuthProvider clientId={CLIENT_ID}>
                <DevSupport ComponentPreviews={ComponentPreviews}
                            useInitialHook={useInitial}
                >
                    <App/>
                </DevSupport>
            </GoogleOAuthProvider>
        </Provider>
    </StrictMode>,
)
