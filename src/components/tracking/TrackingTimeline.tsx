import React from 'react';
import { TrackingInfo, TrackingStatus } from '../../types';

interface TrackingTimelineProps {
  trackingInfo: TrackingInfo;
}

const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ trackingInfo }) => {
  const getStatusColor = (status: TrackingStatus) => {
    switch (status) {
      case TrackingStatus.DELIVERED:
        return 'bg-green-500';
      case TrackingStatus.EXCEPTION:
        return 'bg-red-500';
      case TrackingStatus.RETURNED:
        return 'bg-yellow-500';
      default:
        return 'bg-blue-500';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="relative">
        {/* Línea vertical */}
        <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Eventos del tracking */}
        {trackingInfo.history.map((event, index) => (
          <div key={index} className="relative flex items-start mb-8">
            {/* Círculo del estado */}
            <div className={`absolute left-0 w-8 h-8 rounded-full ${getStatusColor(event.status)} flex items-center justify-center text-white z-10`}>
              <div className="w-4 h-4 bg-white rounded-full"></div>
            </div>
            
            {/* Contenido del evento */}
            <div className="ml-12">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{event.status}</h3>
                    <p className="text-gray-600">{event.location.facility}</p>
                    <p className="text-gray-500 text-sm">{event.location.city}, {event.location.country}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">
                      {new Date(event.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-gray-700">{event.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrackingTimeline; 