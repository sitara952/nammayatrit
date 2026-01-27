import React from 'react';
import { Renderable } from './schema';

// Import all components
import InfoCard from '../components/InfoCard';
import ToggleSetting from '../components/ToggleSetting';
import TrustedContactsList from '../components/TrustedContactsList';
import ShareOptionSelector from '../components/ShareOptionSelector';
import DefaultContactCard from '../components/DefaultContactCard';
import ActionGrid from '../components/ActionGrid';
import HeroImage from '../components/HeroImage';
import HeroTitle from '../components/HeroTitle';
import HeroSubtitle from '../components/HeroSubtitle';
import ToggleCard from '../components/ToggleCard';
import InfoActionCard from '../components/InfoActionCard';
import DropdownCard from './components/DropdownCard';
import AddContactButton from '../components/AddContactButton';
import DefaultContactSelector from '../components/DefaultContactSelector';
import LoadingOverlay from '../components/LoadingOverlay';

export const renderRenderable = (r: Renderable, index: number | undefined = undefined) => {
    switch (r.type) {
        case 'InfoCard':
            return <InfoCard key={r.props.title} {...r.props} />;

        case 'ToggleSetting':
            return <ToggleSetting key={r.props.label} {...r.props} />;

        case 'TrustedContactsList':
            return <TrustedContactsList key={`trusted-contacts-list-${index || 0}`} {...r.props} />;

        case 'ShareOptionSelector':
            return <ShareOptionSelector key={`share-selector-${r.props.contactId}`} {...r.props} />;

        case 'DefaultContactCard':
            return <DefaultContactCard key={`default-contact-${index || 0}`} {...r.props} />;

        case 'ActionGrid':
            return <ActionGrid key={`action-grid-${index || 0}-${r.props.title || 'default'}`} {...r.props} />;

        case 'HeroImage':
            return (
                <HeroImage key={`hero-image-${index || 0}-${r.props.image?.toString() || 'default'}`} {...r.props} />
            );

        case 'HeroTitle':
            return <HeroTitle key={`hero-title-${index || 0}-${r.props.title}`} {...r.props} />;

        case 'HeroSubtitle':
            return <HeroSubtitle key={`hero-subtitle-${index || 0}-${r.props.subtitle}`} {...r.props} />;

        case 'ToggleCard':
            return <ToggleCard key={`toggle-card-${index || 0}-${r.props.label}`} {...r.props} />;

        case 'InfoActionCard':
            return <InfoActionCard key={`info-action-${index || 0}-${r.props.title}`} {...r.props} />;

        case 'DropdownCard':
            return <DropdownCard key={`dropdown-card-${index || 0}-${r.props.label}`} {...r.props} />;

        case 'AddContactButton':
            return <AddContactButton key={`add-contact-button-${index || 0}`} {...r.props} />;

        case 'DefaultContactSelector':
            return <DefaultContactSelector key={`default-contact-selector-${index || 0}`} {...r.props} />;

        case 'LoadingOverlay':
            return <LoadingOverlay key={`loading-overlay-${index || 0}`} {...r.props} />;

        default:
            return null;
    }
};

export default renderRenderable;
