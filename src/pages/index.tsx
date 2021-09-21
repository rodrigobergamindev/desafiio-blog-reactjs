import { GetStaticProps } from 'next';

import { getPrismicClient } from '../services/prismic';
import Prismic from '@prismicio/client'
import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import {RichText} from 'prismic-dom'
import {useState} from 'react'
import Link from 'next/link'

import { format } from 'date-fns';
import ptBR from 'date-fns/locale/pt-BR';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

 export default function Home({ postsPagination }: HomeProps) {
   

  const [nextPageLink, setNextPageLink] = useState(postsPagination.next_page);

  const [goNextPage, setGoNextPage] = useState(false)
  
  const [postData, setPostData] = useState(postsPagination.results)

  const handleNextPage = () => {
    setGoNextPage(!goNextPage)

  fetch(nextPageLink)
    .then(response => response.json())
    .then(function(data) {
      console.log(data)
      const dataToLoad = data.results.map(post => {
        return {        
          uid: post.uid,
          first_publication_date: post.first_publication_date,
          data: {
            title: post.data.title,
            subtitle: post.data.subtitle,
            author: post.data.author,
          },
        }
      }
    )

      setPostData(postData.concat(dataToLoad))
      setNextPageLink(data?.next_page)
    }) 


  }

  return (
    <>
    <h1>Posts</h1>

    <div>
    {postData?.map(posts => (
            <Link href={`/post/${posts.uid}`} key={posts.uid}>
              <a>
                <strong>{posts.data.title}</strong>
                  <p>{posts.data.subtitle}</p>
                  <div className={styles.info}>
                    
                    <p>{format(new Date(posts.first_publication_date), 'dd MMM yyyy', {locale: ptBR, })}</p>
                    
                    <p>{posts.data.author}</p>
                  </div>

                  <div>
                  {nextPageLink === null ? (
                  false
                  ) : <a  className={styles.nextPage} onClick={handleNextPage}>Carregar mais posts</a>}
                  </div>
                </a>
            </Link>
            ))}
    </div>

    </>
  )
   
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  
  

  const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
  ], {
    fetch: ['posts.title', 'posts.subtitle', 'posts.author','posts.content'],
    pageSize: 2,
  });


  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
      
    }
  })  


  return {
    props: {postsPagination: {results: posts, next_page: postsResponse.next_page}}
  }
};
