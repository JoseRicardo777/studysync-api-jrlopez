const errorHandler = (err, req, res, next) => {
    console.error('❌ Error detectado:', err.stack);
  
    if (res.headersSent) {
      return next(err);
    }
  
    res.status(500).json({
      error: 'Error interno del servidor',
      message: err.message || 'Algo salió mal'
    });
  };
  
  module.exports = errorHandler;