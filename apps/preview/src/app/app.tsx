import { EditorWysiwyg as Wysiwyg } from "@lexial-essential/wysiwyg";
import { ImagePlugin } from "libs/wysiwyg/src/lib/plugins/ImagePlugin/ImagePlugin";
import { useEffect } from "react";

const imgBbbKey = process.env.NX_IMGBB_KEY

export function App() {
  useEffect(() => {
    console.log(process.env)
    if (!imgBbbKey) {
      console.error('NX_IMGBB_KEY is not defined')
    }
  }, [])

  return (
    <>
      <Wysiwyg>
        <ImagePlugin uploadImage={async (file) => {
          try {
            if (!imgBbbKey) {
              alert('NX_IMGBB_KEY env are not set')
              return;
            }
            const dataUpload = new FormData()
            dataUpload.append('image', file)
            const res = await fetch(`https://api.imgbb.com/1/upload?key=${imgBbbKey}&expiration=600`, {
              method: 'POST',
              body: dataUpload
            })
            const data = await res.json()
            if (data.status !== 200) {
              throw new Error(data.data.error.message)
            }
            console.log(data)
            return data?.data?.url
          } catch (err) {
            console.error(err)
            alert('Error uploading image')
            return null
          }
        }} />
      </Wysiwyg>

      <div />
    </>
  );
}

export default App;
