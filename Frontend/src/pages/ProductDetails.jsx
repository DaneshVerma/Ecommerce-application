import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import "./ProductDetails.css";
import api from "../api/client";

export default function ProductDetails() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const res = await api.get(`/api/products/${id}`);
        if (!cancelled) setProduct(res.data.product);
      } catch (e) {
        if (!cancelled)
          setError(
            e?.response?.status === 404
              ? "Product not found"
              : "Failed to load product"
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (id) load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  const handlePayment = async () => {
    try {
      // Step 1: Create order on backend
      const { data: order } = await axios.post(
        "http://localhost:5000/api/payment/orders",
        {
          amount: product.price.amount, // Amount in paise
          currency: product.price.currency, // Currency
        },
        { withCredentials: true }
      );

      // Step 2: Razorpay options
      const options = {
        key: import.meta.env.VITE_RAZOR_PAY.ID, // from .env (frontend can use only key_id)
        amount: order.amount,
        currency: order.currency,
        name: "My Company",
        description: "Test Transaction",
        order_id: order.id,
        handler: async function (response) {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
            response;
          try {
            await axios.post("http://localhost:5000/api/payment/verify", {
              razorpayOrderId: razorpay_order_id,
              razorpayPaymentId: razorpay_payment_id,
              signature: razorpay_signature,
            });
            alert("Payment successful!");
          } catch (err) {
            alert("Payment verification failed!");
          }
        },
        prefill: {
          name: "Test User",
          email: "test@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "#3399cc",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className='pd-shell'>
        <p>Loading…</p>
      </div>
    );
  if (error)
    return (
      <div className='pd-shell'>
        <p>{error}</p>
      </div>
    );
  if (!product)
    return (
      <div className='pd-shell'>
        <p>Product not found.</p>
      </div>
    );

  const priceFmt = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: product.price.currency,
  }).format(product.price.amount / 100);
  const activeImage = product.images?.[activeIndex];
  const out = product.stock <= 0;

  return (
    <div className='pd-shell' aria-labelledby='pd-title'>
      <div className='pd-media' aria-label='Product images'>
        {activeImage ? (
          <img src={activeImage} alt={product.title} className='pd-main-img' />
        ) : (
          <div className='pd-main-img' aria-hidden='true' />
        )}
        {product.images && product.images.length > 1 && (
          <div className='pd-thumbs' role='list'>
            {product.images.map((img, i) => (
              <button
                key={img}
                type='button'
                className={`pd-thumb ${i === activeIndex ? "active" : ""}`}
                role='listitem'
                onClick={() => setActiveIndex(i)}
                aria-label={`Show image ${i + 1}`}
              >
                <img src={img} alt='' />
              </button>
            ))}
          </div>
        )}
      </div>
      <div className='pd-info'>
        <h1 id='pd-title' className='pd-title'>
          {product.title}
        </h1>
        <div className={`pd-stock ${out ? "out" : ""}`}>
          {out ? "Out of stock" : `${product.stock} in stock`}
        </div>
        <div className='pd-price' aria-live='polite'>
          {priceFmt}
        </div>
        <p className='pd-desc'>{product.description}</p>
        <div className='pd-actions'>
          <button onClick={handlePayment} className='btn-buy' disabled={out}>
            {out ? "Unavailable" : "Buy now"}
          </button>
        </div>
        <div className='pd-meta'>
          <span>
            <strong>ID:</strong> {product._id}
          </span>
          <span>
            <strong>Currency:</strong> {product.price.currency}
          </span>
        </div>
      </div>
    </div>
  );
}
