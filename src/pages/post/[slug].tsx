import { GetStaticPaths, GetStaticProps } from 'next';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';
import Header from '../../components/Header';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiUser } from "react-icons/fi";
import { WiTime4 } from 'react-icons/wi';

import ptBR from 'date-fns/locale/pt-BR';
import { format } from 'date-fns';
import {useRouter} from 'next/router';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

 export default function Post({post}) {

  const body = post.data.content.map((post) => {
    return RichText.asText(post.body).split(/[\s,]+/).length;
  })

  const heading = post.data.content.map((post) => {
    return post.heading.split(/[\s,]+/).length;
  })

  const postBody = body.reduce((acc, body) => {
    
    return acc += body;
  })

  const postHeading = heading.reduce((acc, heading) => {
    return acc+= heading;
  })

  const totalReadingTime = Math.ceil((postBody+postHeading)/200);


  const router = useRouter()

  if (router.isFallback) {
    return <div>Carregando...</div>
 } 

 return (
  <div>
    <Header/>
    <div className={styles.main}>
      <img src={post.data.banner.url} alt="banner"></img>
      <div className={styles.content}>
        <h1>{post.data.title}</h1>

        <div className={styles.info}>
          <FiCalendar/>
          <p>{format(new Date(post.first_publication_date), 'dd MMM yyyy', {locale: ptBR, })}</p>
          <FiUser/>
          <p>{post.data.author}</p>
          <WiTime4/>
          <p>{totalReadingTime} min</p>
        </div>


        {post.data.content.map((post) => {
          return(
            <div>
              <div>{post.heading}</div>
              <div className={styles.body} dangerouslySetInnerHTML={{__html: RichText.asHtml(post.body)}}/>
            </div>

          )
        })}
        
      </div>
    </div>
  </div>
)


 }

 export const getStaticPaths: GetStaticPaths = async () => {

   const prismic = getPrismicClient();

   const postsResponse = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts')
   ], {
    fetch: ['posts.title', 'posts,subtitle', 'posts.author', 'posts.content'],
    pageSize: 2
   });

   const posts1 = postsResponse.results.map(post => {
    return {
      params: {
        slug: post.uid,
      },
    }
  })

  return {
    paths:posts1,
    fallback: true
  }
 };

 export const getStaticProps: GetStaticProps = async ({params}) => {

  const {slug} = params
   const prismic = getPrismicClient();

   const response = await prismic.getByUID('posts', String(slug), {})

   const post = {
    first_publication_date: response.first_publication_date,
    uid: response.uid,
    data: {
      title: response.data.title,
      subtitle: response.data.subtitle,
      banner: response.data.banner,
      author: response.data.author,
      content: response.data.content

    }
   }


    return {
      props: {post}
    }
   

 }
