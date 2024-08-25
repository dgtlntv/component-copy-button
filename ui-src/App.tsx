import React, { useEffect, useState } from "react"
import * as clipboard from "clipboard-polyfill"

function App() {
    useEffect(() => {
        const handleMessage = async (event) => {
            if (event.data.pluginMessage.type === "copyToClipboard") {
                clipboardHtml(event.data.pluginMessage.data)
                    .then(() => {
                        window.parent.postMessage(
                            {
                                pluginMessage: "success",
                            },
                            "*"
                        )
                        window.parent.postMessage(
                            {
                                pluginMessage: "close",
                            },
                            "*"
                        )
                    })
                    .catch((e) => {
                        window.parent.postMessage(
                            {
                                pluginMessage: "failure",
                            },
                            "*"
                        )
                        console.log(e)
                        window.parent.postMessage(
                            {
                                pluginMessage: "close",
                            },
                            "*"
                        )
                    })
            }
        }

        window.addEventListener("message", handleMessage)

        // Cleanup function
        return () => {
            window.removeEventListener("message", handleMessage)
        }
    }, [])

    const [componentString, setComponentString] = useState(null)
    const [saveButtonState, setSaveButtonState] = useState(true)

    useEffect(() => {
        const handlePaste = (event) => {
            const clipboardData = event.clipboardData
            const items = clipboardData.items

            for (let i = 0; i < items.length; i++) {
                const item = items[i]
                if (item.kind === "string" && item.type === "text/html") {
                    item.getAsString((str) => {
                        setComponentString(str)
                        setSaveButtonState(false)
                    })
                }
            }
        }

        window.addEventListener("paste", handlePaste)

        // Cleanup the event listener on component unmount
        return () => {
            window.removeEventListener("paste", handlePaste)
        }
    }, [])

    useEffect(() => {
        const handlePreviouseComponentStringMessage = async (event) => {
            if (event.data.pluginMessage.type === "previouseComponentString") {
                setComponentString(event.data.pluginMessage.data)
            }
        }

        window.addEventListener("message", handlePreviouseComponentStringMessage)

        return () => {
            window.removeEventListener("message", handlePreviouseComponentStringMessage)
        }
    }, [])

    async function clipboardHtml(htmlString: string) {
        const html = new Blob([htmlString], { type: "text/html" })
        const data = new clipboard.ClipboardItem({ "text/html": html })
        await clipboard.write([data])
    }

    return (
        <div style={{ padding: "24px" }}>
            <h1>Settings</h1>
            <p className="">
                Copy the Figma component you want to be pasted if the widget button is clicked and CTRL + V while this
                window is focused.
            </p>

            {componentString ? (
                <>
                    <h4 className="u-no-padding--top">Current component string</h4>
                    <pre>
                        <code>{componentString}</code>
                    </pre>
                </>
            ) : null}

            <div className="u-align--right">
                <button
                    className="p-button--base"
                    onClick={() => {
                        window.parent.postMessage(
                            {
                                pluginMessage: "close",
                            },
                            "*"
                        )
                    }}
                >
                    Cancel
                </button>
                <button
                    className="p-button--positive"
                    disabled={saveButtonState}
                    onClick={() => {
                        window.parent.postMessage(
                            {
                                pluginMessage: { type: "setComponentString", data: componentString },
                            },
                            "*"
                        )

                        window.parent.postMessage(
                            {
                                pluginMessage: "close",
                            },
                            "*"
                        )
                    }}
                >
                    Save
                </button>
            </div>
        </div>
    )
}

export default App
