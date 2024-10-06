import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import '../styles/components/imagecarousel.css';

const ImageCarousel = ({ images = [] }) => {
  if (images.length === 0) {
    return <div className="placeholder-image">No Image Available</div>;
  }

  const settings = {
    dots: images.length > 1,
    infinite: images.length > 1,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: images.length > 1
  };

  return (
    <div className={images.length === 1 ? "single-image-container" : "image-carousel"}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <div key={index} className={images.length === 1 ? "" : "carousel-slide"}>
            <div className={images.length === 1 ? "" : "image-wrapper"}>
              <img 
                src={image.image_url} 
                alt={`Image ${index + 1}`} 
                className={images.length === 1 ? "single-image" : "carousel-image"}
              />
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};
export default ImageCarousel;
