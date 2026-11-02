import { useRouter } from '../context/RouterContext';
import Carousel from '../components/home/Carousel';
import CategorySection from '../components/home/CategorySection';
import FeaturedProducts from '../components/home/FeaturedProducts';
import Banner2 from '../assets/Image/banner/banner (2).png';
import TrendingProducts from '../components/home/TrendingProduct';
import MensShoes from '../components/home/ElectronicsProduct';
import BannerSlider from '../components/home/CarouselBottom';
export default function Home() {
    const { navigate } = useRouter(); return (
        <div className="space-y-20 pb-16">
            <Carousel />
            <CategorySection />
            <FeaturedProducts />
             <BannerSlider />
           

            <TrendingProducts />
            <MensShoes />
           
 <section className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">
                <img src={Banner2} alt="Banner2" className='rounded-2xl' />
            </section>
        </div>)
        ;
}
