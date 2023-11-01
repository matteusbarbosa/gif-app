
import { useState } from 'react';
import { API_KEY } from '../credentials';

const styles = {
    wrapper: {
        display: 'flex',
        flexDirection: 'row',
    },
    search: {
        width: '200px',
        height: '50px',
    },
    btn:{
        width: '50px',
        height: '50px',
    },
    thumbnailsArea: {

    },
    lightbox: {
        position: 'absolute',
        top: '0',
        left: '0',
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100vw',
        height: '100vh',
        zIndex: '1'
    },
    lightboxContent: {
        background: 'rgba(255,255,255,0.75)',
        borderRadius: '30px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '50vw',
        height: '50vw',
    },
    currentGif: {
        maxWidth: '100%',
    }
};

function Form() {
    const fixedLimit = 10;
    const [search, setSearch] = useState('');
    const [thumbnails, setThumbnails] = useState([]);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentGif, setCurrentGif] = useState(null);
    const [offset, setOffset] = useState(0);

   const onChangeSearch = (e) => {
        setSearch(e.value);
   };

   const fetchThumbs = async (search) =>  {
    try {
        
        const url = 'https://api.giphy.com/v1/stickers/search';
      const response = await fetch(url + '?api_key='+ API_KEY +'&q=' + search + '&limit=' + fixedLimit + '&offset=' + offset, {
        method: "GET", // or 'PUT'
      });
      
      if (!response.ok) {
        throw new Error("No images to display");
      }

      const json = await response.json();
      const rest = Math.round((json.total_count - json.offset) / fixedLimit);
      const currentPage = Math.round(json.offset - fixedLimit);

      return {
        amountOfPages: Math.round(json.total_count / json.count),
        currentPage,
        data: json.data
      };

      // const data = await response.json();

    } catch (error) {
      console.error("Error fetching images:", error);
    }
  }

   const loadMoreAction = async () => {

        // adds +10
        const { data: thumbnailsRequest } = await fetchThumbs(search);

        const addedThumbnails = thumbnailsRequest.map((t) => ({
            largeSizeUrl : t.images.original?.url,
            thumbnailUrl : t.images.downsized?.url,
            id: t.id,
        }));
        console.log(thumbnails)
        setThumbnails([ ...thumbnails, ...addedThumbnails ]);
        setOffset(offset + fixedLimit);
   }

   const viewInLightbox = (id) => {
        setCurrentGif(thumbnails.find((t) => id === t.id));
        setLightboxOpen(true);
   };

  return (
    <div className="Form">
        <div className="btn-group" style={styles.wrapper}>
            <input type="search" onChange={onChangeSearch} style={styles.search} />
            <button type="button" onClick={loadMoreAction} style={styles.btn} >Fetch</button>
        </div>
        <section style={styles.thumbnailsArea}>
            {
                thumbnails.map(({ thumbnailUrl, id }) => {
                    return <div>
                        <img src={thumbnailUrl} alt="" title="" onClick={() => viewInLightbox(id)} />
                    </div>
                })
            }
        </section>
        <button style={styles.loadMore} onClick={loadMoreAction} hidden={offset === 0}>Load more {offset}</button>
        {!!currentGif && lightboxOpen && (<div style={styles.lightbox}>
            <div style={styles.lightboxContent}>
                <img src={currentGif.largeSizeUrl} style={styles.currentGif} alt="" title="" />
            </div>
        </div>)
        }
    </div>
  );
}

export default Form;
