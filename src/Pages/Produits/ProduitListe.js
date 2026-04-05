import React, { useMemo, useState } from 'react';
import {
  Button,
  Card,
  CardBody,
  CardText,
  CardTitle,
  Col,
  Container,
  DropdownItem,
  DropdownMenu,
  DropdownToggle,
  Row,
  UncontrolledDropdown,
} from 'reactstrap';
import Breadcrumbs from '../../components/Common/Breadcrumb';
import FormModal from '../components/FormModal';

import LoadingSpiner from '../components/LoadingSpiner';
import { capitalizeWords, formatPrice } from '../components/capitalizeFunction';

import { deleteButton } from '../components/AlerteModal';
import defaultImg from './../../assets/images/no_image.png';
import { useNavigate } from 'react-router-dom';
import ProduitForm from './ProduitForm';
import { useAllProduit, useDeleteProduit } from '../../Api/queriesProduits';
import { connectedUserRole } from '../Authentication/userInfos';

export default function ProduitListe() {
  const [form_modal, setForm_modal] = useState(false);
  const { data: produits, isLoading, error } = useAllProduit();
  const { mutate: deleteProduit } = useDeleteProduit();
  const [produitToUpdate, setProduitToUpdate] = useState(null);
  const [formModalTitle, setFormModalTitle] = useState('Ajouter un Produit');

  // Recherche State
  const [searchTerm, setSearchTerm] = useState('');

  // Fontion pour Rechercher
  const filterSearchProduits = useMemo(() => {
    return produits?.filter((prod) => {
      const search = searchTerm.toLowerCase();

      return (
        prod?.name?.toLowerCase().includes(search) ||
        prod?.category?.toLowerCase().includes(search) ||
        prod?.stock?.toString().includes(search) ||
        prod?.price?.toString().includes(search)
      );
    });
  }, [produits, searchTerm]);

  // Utilisation de useNavigate pour la navigation
  const navigate = useNavigate();
  // Function to handle deletion of a medicament
  function navigateToProduitApprovisonnement(id) {
    navigate(`/approvisonnement/${id}`);
  }

  function tog_form_modal() {
    setForm_modal(!form_modal);
  }

  const totalProduitAchatPrice = useMemo(
    () =>
      filterSearchProduits?.reduce(
        (acc, item) => (acc += item?.achatPrice * item?.stock),
        0
      ),
    [filterSearchProduits]
  );
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  // -----------------------------------------------------------------
  return (
    <React.Fragment>
      <div className='page-content'>
        <Container fluid>
          <Breadcrumbs title='Produits' breadcrumbItem='Liste de Produits' />

          {/* -------------------------- */}
          <FormModal
            form_modal={form_modal}
            setForm_modal={setForm_modal}
            tog_form_modal={tog_form_modal}
            modal_title={formModalTitle}
            size='md'
            bodyContent={
              <ProduitForm
                produitToEdit={produitToUpdate}
                tog_form_modal={tog_form_modal}
              />
            }
          />

          {/* -------------------------- */}

          <Row>
            <Col lg={12}>
              <Card>
                <CardBody>
                  <div id='produitsList'>
                    <Row className='g-4 mb-3'>
                      {connectedUserRole === 'admin' && (
                        <Col className='col-sm-auto'>
                          <div className='d-flex gap-1'>
                            <Button
                              color='info'
                              className='add-btn'
                              id='create-btn'
                              onClick={() => {
                                setProduitToUpdate(null);
                                tog_form_modal();
                              }}
                            >
                              <i className='mdi mdi-sitemap align-center me-1'></i>{' '}
                              Ajouter un Produit
                            </Button>
                          </div>
                        </Col>
                      )}
                      <Col>
                        <p className='text-center font-size-15 mt-2'>
                          Produit Total:{' '}
                          <span className='text-warning'>
                            {' '}
                            {produits?.length}{' '}
                          </span>
                        </p>
                        <p className='text-center font-size-15 mt-2'>
                          Valeur de Boutique:{' '}
                          <span className='text-warning'>
                            {' '}
                            {formatPrice(totalProduitAchatPrice)}{' '}
                          </span>
                        </p>
                      </Col>
                      <Col>
                        <div className='d-flex justify-content-sm-end gap-2'>
                          {searchTerm !== '' && (
                            <Button
                              color='danger'
                              onClick={() => setSearchTerm('')}
                            >
                              <i className='fas fa-window-close'></i>
                            </Button>
                          )}
                          <div className='search-box me-4'>
                            <input
                              type='text'
                              className='form-control search border border-dark rounded'
                              placeholder='Rechercher...'
                              value={searchTerm}
                              onChange={(e) => setSearchTerm(e.target.value)}
                            />
                          </div>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </CardBody>
              </Card>
            </Col>
          </Row>
          <div className='d-flex justify-content-center align-items-center gap-4 flex-wrap'>
            {isLoading && <LoadingSpiner />}
            {error && (
              <div className='text-danger text-center'>
                Erreur lors de chargement des données
              </div>
            )}
            {!error && !isLoading && filterSearchProduits?.length === 0 && (
              <div className='text-center'>Aucun Produit trouvés</div>
            )}
            {!error &&
              !isLoading &&
              filterSearchProduits?.length > 0 &&
              filterSearchProduits?.map((prod, index) => (
                <Card
                  key={index}
                  style={{
                    boxShadow: '0px 0px 10px rgba(121,3,105,0.5)',
                    borderRadius: '15px',
                    padding: '10px 20px',
                    display: 'flex',
                    flexWrap: 'nowrap',
                    alignItems: 'center',
                    position: 'relative',
                    width: '210px',
                  }}
                >
                  {connectedUserRole === 'admin' && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '5%',
                        right: '5%',
                      }}
                    >
                      <UncontrolledDropdown className='dropdown d-inline-block'>
                        <DropdownToggle
                          className='btn btn-soft-secondary btn-sm'
                          tag='button'
                        >
                          <i className='bx bx-caret-down-square fs-2 text-info'></i>
                        </DropdownToggle>
                        <DropdownMenu className='dropdown-menu-end'>
                          <DropdownItem
                            className='edit-item-btn  text-secondary'
                            onClick={() => {
                              setFormModalTitle('Modifier les données');
                              setProduitToUpdate(prod);
                              tog_form_modal();
                            }}
                          >
                            <i className='ri-pencil-fill align-bottom me-2 '></i>
                            Modifier
                          </DropdownItem>
                          <DropdownItem
                            className='edit-item-btn text-warning'
                            onClick={() => {
                              navigateToProduitApprovisonnement(prod?._id);
                            }}
                          >
                            <i className='bx bx-analyse align-bottom me-2 '></i>
                            Approvisonner
                          </DropdownItem>

                          <DropdownItem
                            className='remove-item-btn text-danger '
                            onClick={() => {
                              deleteButton(
                                prod?._id,
                                prod?.name,
                                deleteProduit
                              );
                            }}
                          >
                            {' '}
                            <i className='ri-delete-bin-fill align-bottom me-2 '></i>{' '}
                            Supprimer{' '}
                          </DropdownItem>
                        </DropdownMenu>
                      </UncontrolledDropdown>
                    </div>
                  )}
                  <CardTitle
                    style={{
                      position: 'absolute',
                      top: '5%',
                      left: '5%',
                    }}
                  >
                    {formatPrice(prod?.achatPrice ?? 0)} F
                  </CardTitle>
                  <img
                    className='img-fluid'
                    style={{
                      borderRadius: '15px 15px 0 0',
                      height: '100px',
                      width: '60%',
                      objectFit: 'contain',
                    }}
                    src={prod?.imageUrl ? prod?.imageUrl : defaultImg}
                    alt={prod?.name}
                  />

                  <CardBody>
                    <CardText
                      className='fs-6 text-center'
                      style={{ width: '200px' }}
                    >
                      {capitalizeWords(prod?.name)}
                    </CardText>

                    <CardTitle className='text-center'>
                      {formatPrice(prod?.price)} F
                    </CardTitle>

                    <CardTitle className='text-center'>
                      Stock:
                      {prod?.stock >= 10 ? (
                        <span style={{ color: 'gray' }}>
                          {' '}
                          {formatPrice(prod?.stock)}
                        </span>
                      ) : (
                        <span className='text-danger'>
                          {' '}
                          {formatPrice(prod?.stock)}
                        </span>
                      )}
                    </CardTitle>
                  </CardBody>
                </Card>
              ))}
          </div>
        </Container>
      </div>
    </React.Fragment>
  );
}
